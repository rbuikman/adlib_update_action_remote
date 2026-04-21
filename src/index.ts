import { Assets10Client } from '@woodwing/a10-client-sdk';
import './style.css';

// Config will be loaded dynamically at runtime
let config: {
  CLIENT_URL_WHITELIST: string[];
} | null = null;

const introDiv = document.getElementById('intro');
const assetsContainer = document.getElementById('assetsContainer');
const infoDiv = document.getElementById('info');

let client: Assets10Client;
let selectedAssets: any[] = [];
let processedCount = 0;
let totalCount = 0;

// Load configuration
async function loadConfig() {
  try {
    const response = await fetch('./config.json');
    config = await response.json();
    console.log('Config loaded:', config);
  } catch (error) {
    console.error('Failed to load config:', error);
    showError('Failed to load configuration');
  }
}

// Initialize the plugin
async function initialize() {
  await loadConfig();
  
  try {
    // Log environment information
    console.log('=== Plugin Initialization ===');
    console.log('Current URL:', window.location.href);
    console.log('Is in iframe:', window !== window.parent);
    
    // Initialize the Assets 10 SDK with debug enabled
    console.log('Calling Assets10Client.bootstrap()...');
    const bootstrapStart = Date.now();
    
    try {
      client = await Assets10Client.bootstrap({
        debug: true,
        handshakeTimeoutMs: 10000,
        requestTimeoutMs: 15000
      });
      
      const elapsed = Date.now() - bootstrapStart;
      console.log(`✅ Assets10Client.bootstrap() completed in ${elapsed}ms`);
      console.log('Client initialized:', client);
    } catch (bootstrapError: any) {
      const elapsed = Date.now() - bootstrapStart;
      console.error(`Assets10Client.bootstrap() failed after ${elapsed}ms`);
      console.error('Bootstrap error:', bootstrapError);
      
      if (bootstrapError?.code === 'handshake_timeout') {
        throw new Error('Handshake timeout: Plugin configuration might be incorrect. Make sure the plugin is added as an "Action Plugin" in Management Console.');
      }
      throw bootstrapError;
    }
    
    // Get plugin context
    const context = client.getPluginContext();
    console.log('Plugin context:', context);
    
    // Get selected assets
    const selection = context.app.assetSelection;
    console.log('Asset selection:', selection);
    
    if (!selection || selection.length === 0) {
      showError('Geen beeld geselecteerd, selecteer minimaal 1 beeld');
      return;
    }
    
    selectedAssets = selection;
    totalCount = selectedAssets.length;
    
    introDiv!.innerHTML = `<p>${totalCount} asset(s) geselecteerd</p>`;
    
    // Start processing
    await processAssets();
    
  } catch (error: any) {
    console.error('=== Initialization Error ===');
    console.error('Error type:', error?.constructor?.name || typeof error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error:', error);
    
    let errorMessage = 'Initialization failed';
    
    // Handle different error types
    if (error?.code === 'handshake_timeout') {
      errorMessage = `<strong>Handshake Timeout</strong><br><br>
        De plugin kan geen verbinding maken met WoodWing Assets.<br><br>
        <strong>Mogelijke oorzaken:</strong><br>
        • Plugin is niet correct geconfigureerd in Management Console<br>
        • Plugin moet worden toegevoegd als "Action Plugin", niet als "Panel Plugin"<br>
        • URL in plugin configuratie is niet correct<br><br>
        <strong>Configuratie vereisten:</strong><br>
        • Type: <em>Action Plugin</em><br>
        • URL: <code>https://rbuikman.github.io/adlib_update_action_remote/index.html</code><br>
        • Location: Asset context menu / Toolbar<br>`;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    showError(errorMessage);
  }
}

// Process all selected assets
async function processAssets() {
  if (!assetsContainer) return;
  
  assetsContainer.innerHTML = '<h3>Resultaat:</h3><div id="resultList" class="result-list"></div>';
  const resultList = document.getElementById('resultList');
  
  for (const asset of selectedAssets) {
    await processAsset(asset, resultList);
  }
  
  // Show completion message
  if (infoDiv) {
    infoDiv.innerHTML = 'De Axiell Collections metadata aanvragen worden elke minuut verwerkt';
    infoDiv.style.display = 'block';
  }
}

// Process a single asset
async function processAsset(asset: any, resultList: HTMLElement | null) {
  processedCount++;
  
  try {
    // Check if asset has AC record ID
    if (!asset.metadata.cf_acRecordId) {
      addResult(resultList, asset.metadata.name || asset.id, 'heeft geen AC record nummer', 'error');
      return;
    }
    
    // Update metadata using A10 SDK
    const metadata = {
      cf_acStatus: 'Metadata update requested',
      cf_acTimestamp: '1970-01-01T00:00:00'
    };
    
    await client.updateBulkById([asset.id], metadata);
    
    addResult(resultList, asset.metadata.name || asset.id, 'klaargezet voor metadata update', 'success');
    
  } catch (error: any) {
    console.error('Error updating asset:', error);
    const errorMsg = error.message || error.data?.message || 'Update failed';
    addResult(resultList, asset.metadata.name || asset.id, errorMsg, 'error');
  }
}

// Add a result item to the list
function addResult(resultList: HTMLElement | null, assetName: string, message: string, type: 'success' | 'error') {
  if (!resultList) return;
  
  const resultItem = document.createElement('div');
  resultItem.className = `result-item ${type}-item`;
  resultItem.innerHTML = `<strong>${assetName}:</strong> ${message}`;
  resultList.appendChild(resultItem);
  
  // Update progress
  updateProgress();
}

// Update progress display
function updateProgress() {
  const percentage = Math.round((processedCount / totalCount) * 100);
  if (introDiv) {
    const progressText = introDiv.querySelector('.progress-text');
    if (progressText) {
      progressText.textContent = `Voortgang: ${processedCount} van ${totalCount} (${percentage}%)`;
    } else {
      const p = document.createElement('p');
      p.className = 'progress-text';
      p.textContent = `Voortgang: ${processedCount} van ${totalCount} (${percentage}%)`;
      introDiv.appendChild(p);
    }
  }
}

// Show error message
function showError(message: string) {
  if (introDiv) {
    introDiv.innerHTML = `<div class="error-message">${message}</div>`;
  }
}

// Start the plugin when page loads
document.addEventListener('DOMContentLoaded', () => {
  initialize();
});
