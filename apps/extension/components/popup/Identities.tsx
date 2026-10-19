import { ui, type WalletState } from "../../lib/messages";
import { BackHeader, Icon } from "../ui";
import { IdentityOption } from "./Home";
import type { Navigate } from "./state";

export function Identities({
  state,
  onState,
  navigate,
}: {
  state: WalletState;
  onState: (s: WalletState) => void;
  navigate: Navigate;
}) {
  const remove = async (identityId: string, name: string) => {
    if (!confirm(`Remove ${name}? Its private key is deleted from this browser and cannot be recovered. You can re-enrol with your CA later.`)) {
      return;
    }
    onState(await ui("removeIdentity", { identityId }));
  };

  return (
    <>
      <BackHeader title="Identities" onBack={() => navigate({ name: "home" })} />
      <main className="page" style={{ gap: 18 }}>
        {state.identities.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {state.identities.map((identity) => (
              <div key={identity.id} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <IdentityOption
                  identity={identity}
                  active={identity.id === state.settings.activeIdentityId}
                  onSelect={async () => onState(await ui("setActive", { identityId: identity.id }))}
                />
                <button
                  type="button"
                  className="link-btn"
                  style={{ padding: "2px 12px", fontSize: 12, color: "var(--weft-text-subtle)" }}
                  onClick={() => void remove(identity.id, identity.name)}
                >
                  Remove {identity.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {state.pendingCsrs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="eyebrow">Waiting for a certificate</div>
            {state.pendingCsrs.map((p) => (
              <button
                key={p.id}
                type="button"
                className="identity-option"
                onClick={() => navigate({ name: "complete-csr", pendingId: p.id })}
              >
                <span className="avatar">{p.commonName.charAt(0)}</span>
                <span className="list-item__body">
                  <span className="list-item__title">{p.commonName}</span>
                  <span className="subtle" style={{ fontSize: 12 }}>
                    {p.networkName} · paste the issued certificate
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        <AddIdentityOptions navigate={navigate} />

        <div className="row" style={{ marginTop: "auto", fontSize: 12, color: "var(--weft-text-muted)" }}>
          <Icon name="shield" size={18} />
          Private keys are created in this browser and can never be exported, even by Weft.
        </div>
      </main>
    </>
  );
}

export function AddIdentityOptions({ navigate }: { navigate: Navigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="eyebrow">Add an identity</div>
      <button type="button" className="invite-tile" onClick={() => navigate({ name: "join" })}>
        <Icon name="qr" color="var(--weft-thread)" />
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontWeight: 500 }}>Join from an org invite</span>
          <span className="muted" style={{ fontSize: 12 }}>
            Paste the link from your network admin
          </span>
        </span>
      </button>
      <div className="add-grid">
        <button type="button" className="add-tile" onClick={() => navigate({ name: "enroll" })}>
          <Icon name="key" size={18} />
          Enroll with CA
        </button>
        <button type="button" className="add-tile" onClick={() => navigate({ name: "import" })}>
          <Icon name="file" size={18} />
          Import PEM
        </button>
        <button type="button" className="add-tile" onClick={() => navigate({ name: "csr" })}>
          <Icon name="upload" size={18} />
          Generate CSR
        </button>
      </div>
    </div>
  );
}
