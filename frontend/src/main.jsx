import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {DbConnection} from "./module_bindings"
import { SpacetimeDBProvider } from "spacetimedb/react";

const SPACETIME_URL = import.meta.env.VITE_SPACETIME_URL || "ws://localhost:3000";
const DB_NAME = import.meta.env.VITE_DB_NAME || "15puzzle-db1";

const connectionBuilder = DbConnection.builder()
  .withUri(SPACETIME_URL)
  .withDatabaseName (DB_NAME)
  .onConnect((conn, identity, token)=>{
    console.log("Connected! Identity:", identity.toHexString());
    conn.subscriptionBuilder().subscribe([
      'SELECT * FROM room',
      'SELECT * FROM player',
      'SELECT * FROM ',
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
