---
title: Publish an org invite
description: Give users a single link that tells Weft where your CA and relay are.
---

An invite is a small JSON file you host over HTTPS. Users paste a link to it into Weft, review what they're joining, and enrol with the enrollment ID and secret your registrar gave them. Nobody types a URL.

## The file

```json
{
  "weft": 1,
  "network": "Acme Supply Network",
  "organization": "Org1",
  "mspId": "Org1MSP",
  "caUrl": "https://ca.org1.example.com:7054",
  "caName": "ca-org1",
  "relayUrl": "https://relay.org1.example.com",
  "channels": ["mychannel"],
  "enrollmentId": "jdoe"
}
```

| Field | Required | Notes |
|---|---|---|
| `weft` | Yes | Schema version. Always `1` for now. |
| `network` | Yes | Display name. |
| `organization` | Yes | Display name of your organisation. |
| `mspId` | Yes | Your MSP ID. |
| `caUrl` | Yes | Base URL of your Fabric CA. |
| `caName` | No | Needed when the CA server hosts several CAs. |
| `relayUrl` | Yes | Base URL of your [relay](/operators/relay/). |
| `channels` | Yes | Channels members of this org use. |
| `enrollmentId` | No | Pre-fills the enrollment ID, for per-person invites. |

Serve it with `content-type: application/json` over HTTPS. Plain HTTP is accepted only on `localhost`.

## The link

Any of these work:

- `https://org1.example.com/weft-invite.json`
- `weft://invite?u=https%3A%2F%2Forg1.example.com%2Fweft-invite.json`
- `https://org1.example.com/join?weft-invite=https%3A%2F%2Forg1.example.com%2Fweft-invite.json`

The `weft://` form is the one to put in QR codes and emails.

## Good practice

- **One file per organisation**, or per person when you pre-fill `enrollmentId`. Never put secrets in the invite; send the enrollment secret through a separate channel.
- **Keep the URLs stable.** Moving the CA or relay means re-issuing invites.
- **Let the CA and relay allow the extension.** Weft calls the CA from its background worker with host permission, so CORS doesn't apply there. The relay must allow cross-origin requests, which it does by default.
