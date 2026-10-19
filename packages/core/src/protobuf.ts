/**
 * A minimal protobuf reader.
 *
 * The wallet must check what it signs (docs/adr/0001), so it decodes the
 * handful of Fabric messages involved. Pulling in the full generated Fabric
 * protos would add a large dependency and Node-only gRPC code to the
 * extension; reading a few known fields by number is enough.
 */

export type FieldValue = { wire: 0; value: bigint } | { wire: 1 | 5; value: Uint8Array } | { wire: 2; value: Uint8Array };

export class ProtobufError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProtobufError";
  }
}

/** Parses one message into a map of field number to every value seen. */
export function readFields(bytes: Uint8Array): Map<number, FieldValue[]> {
  const fields = new Map<number, FieldValue[]>();
  let pos = 0;

  const varint = (): bigint => {
    let result = 0n;
    let shift = 0n;
    for (;;) {
      if (pos >= bytes.length) throw new ProtobufError("Truncated varint");
      const byte = bytes[pos++]!;
      result |= BigInt(byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) return result;
      shift += 7n;
      if (shift > 63n) throw new ProtobufError("Varint too long");
    }
  };

  const take = (length: number): Uint8Array => {
    if (pos + length > bytes.length) throw new ProtobufError("Truncated field");
    const out = bytes.subarray(pos, pos + length);
    pos += length;
    return out;
  };

  while (pos < bytes.length) {
    const key = Number(varint());
    const field = key >>> 3;
    const wire = key & 7;
    let entry: FieldValue;
    switch (wire) {
      case 0:
        entry = { wire: 0, value: varint() };
        break;
      case 1:
        entry = { wire: 1, value: take(8) };
        break;
      case 2:
        entry = { wire: 2, value: take(Number(varint())) };
        break;
      case 5:
        entry = { wire: 5, value: take(4) };
        break;
      default:
        throw new ProtobufError(`Unsupported wire type ${wire} for field ${field}`);
    }
    const list = fields.get(field);
    if (list) list.push(entry);
    else fields.set(field, [entry]);
  }
  return fields;
}

const decoder = new TextDecoder();
const EMPTY = new Uint8Array(0);

/** Accessors for a decoded message, with proto3 defaults for missing fields. */
export class Message {
  readonly fields: Map<number, FieldValue[]>;

  constructor(bytes: Uint8Array) {
    this.fields = readFields(bytes);
  }

  bytes(field: number): Uint8Array {
    const list = this.fields.get(field);
    const last = list?.[list.length - 1];
    if (!last) return EMPTY;
    if (last.wire !== 2) throw new ProtobufError(`Field ${field} is not length-delimited`);
    return last.value;
  }

  repeatedBytes(field: number): Uint8Array[] {
    return (this.fields.get(field) ?? []).map((v) => {
      if (v.wire !== 2) throw new ProtobufError(`Field ${field} is not length-delimited`);
      return v.value;
    });
  }

  string(field: number): string {
    return decoder.decode(this.bytes(field));
  }

  repeatedString(field: number): string[] {
    return this.repeatedBytes(field).map((b) => decoder.decode(b));
  }

  message(field: number): Message {
    return new Message(this.bytes(field));
  }

  varint(field: number): bigint {
    const list = this.fields.get(field);
    const last = list?.[list.length - 1];
    if (!last) return 0n;
    if (last.wire !== 0) throw new ProtobufError(`Field ${field} is not a varint`);
    return last.value;
  }
}
