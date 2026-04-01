import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {DbConnection} from "./module_bindings"
import { SpacetimeDBProvider } from "spacetimedb/react";

const connectionBuilder = DbConnection.builder()
  .withUri("ws://localhost:3000")
  .withModuleName("15-puzzle")
  .onConnect((conn, identity, token)=>{
    console.log("Connected! Identity:", identity.toHexString());

  })
    .onDisconnect(() => {
    console.log("Disconnected from SpacetimeDB");
  })
  .onError((err) => {
    console.error("Connection error:", err);
  });


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <App />
    </SpacetimeDBProvider>
    
  </StrictMode>,
)
