import { useState } from "react";
import { CompleteCsr, CsrForm, EnrollForm, ImportForm, JoinInvite } from "../../components/popup/AddForms";
import { Home } from "../../components/popup/Home";
import { AddIdentityOptions, Identities } from "../../components/popup/Identities";
import { TxDetail } from "../../components/popup/TxDetail";
import { useWallet, type Route } from "../../components/popup/state";
import { WovenMark } from "../../components/ui";

export function App() {
  const { state, setState, error, refresh } = useWallet();
  const [route, setRoute] = useState<Route>({ name: "home" });

  if (error) return <div className="empty error-text">{error}</div>;
  if (!state) return null;

  const onDone = async () => {
    await refresh();
    setRoute({ name: "home" });
  };
  const props = { state, navigate: setRoute, onDone };

  switch (route.name) {
    case "identities":
      return <Identities state={state} onState={setState} navigate={setRoute} />;
    case "join":
      return <JoinInvite {...props} />;
    case "enroll":
      return <EnrollForm {...props} />;
    case "import":
      return <ImportForm {...props} />;
    case "csr":
      return <CsrForm {...props} />;
    case "complete-csr":
      return <CompleteCsr {...props} pendingId={route.pendingId} />;
    case "tx":
      return <TxDetail state={state} activityId={route.activityId} navigate={setRoute} />;
    case "home":
      if (state.identities.length === 0) return <Welcome navigate={setRoute} />;
      return <Home state={state} onState={setState} navigate={setRoute} />;
  }
}

function Welcome({ navigate }: { navigate: (r: Route) => void }) {
  return (
    <main className="page" style={{ gap: 24, paddingTop: 40 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
        <WovenMark size={72} />
        <div>
          <div className="mono" style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>
            weft
          </div>
          <p className="muted" style={{ margin: "10px 0 0", fontSize: 15 }}>
            The network is the warp. Your identity and transactions are the weft, woven through it.
          </p>
        </div>
      </div>
      <AddIdentityOptions navigate={navigate} />
    </main>
  );
}
