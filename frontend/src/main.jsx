import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {DbConnection, tables} from "./module_bindings"
import { SpacetimeDBProvider } from "spacetimedb/react";

const SPACETIME_URL = import.meta.env.VITE_SPACETIME_URL || "ws://localhost:3000";
const DB_NAME = import.meta.env.VITE_DB_NAME || "15puzzle-db1";
const TOKEN_KEY = `${SPACETIME_URL}/${DB_NAME}/auth_token`;

const connectionBuilder = DbConnection.builder()
  .withUri(SPACETIME_URL)
  .withDatabaseName (DB_NAME)
  .onConnect((ctx, identity, token)=>{
    localStorage.setItem(TOKEN_KEY, token);
    console.log("Connected! Identity:", identity.toHexString());

    
    ctx.subscriptionBuilder()
    .onApplied(() => {
      console.log("Subscription applied");
    })
    .subscribe([
      'SELECT * FROM Player',
      'SELECT * FROM Room',
      'SELECT * FROM GameBoard',
    ]);
  })
    .onDisconnect(() => {
    console.log("Disconnected from SpacetimeDB");
  })
  .onConnectError((err) => {
    console.error("Connection error:", err);
  });
    


    ctx.db.Player.onInsert((ctx, newPlayer) => {
      console.log("Player table updated:", newPlayer);
    });

  });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <App />
    </SpacetimeDBProvider>
    
  </StrictMode>,
)
