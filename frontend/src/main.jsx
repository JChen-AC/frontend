import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {DbConnection} from "./module_bindings"
import { SpacetimeDBProvider } from "spacetimedb/react";

const connectionBuilder = DbConnection.builder()
  .withUri("ws://localhost:3000")
  .withDatabaseName ("15puzzle-db1")
  .onConnect((conn, identity, token)=>{
    console.log("Connected! Identity:", identity.toHexString());
    conn.subscriptionBuilder().subscribe([
      'SELECT * FROM room',
      'SELECT * FROM player',
    ]);
  })
    .onDisconnect(() => {
    console.log("Disconnected from SpacetimeDB");
  })
  .onConnectError((err) => {
    console.error("Connection error:", err);
  });


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <App />
    </SpacetimeDBProvider>
    
  </StrictMode>,
)
