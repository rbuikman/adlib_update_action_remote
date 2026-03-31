import { AssetsApiClient, AssetsPluginContext } from '@woodwing/assets-client-sdk';
import './style.css';

// Config will be loaded dynamically at runtime
let config: {
  CLIENT_URL_WHITELIST: string[];
} | null = null;

const introDiv = document.getElementById('intro');
const assetsContainer = document.getElementById('assetsContainer');
const infoDiv = document.getElementById('info');

let apiClient: AssetsApiClient;
let contextService: AssetsPluginContext;
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
    // Initialize the Assets SDK using static methods
    // Timeout for Assets SDK connection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout: Not embedded in WoodWing Assets'));
      }, 5000);
    });
    
    const contextPromise = AssetsPluginContext.get(config?.CLIENT_URL_WHITELIST || []);
    
    contextService = await Promise.race([
      contextPromise,
      timeoutPromise
    ]) as AssetsPluginContext;
    
    console.log('Plugin context initialized');
    
    // Create API client from context
    apiClient = AssetsApiClient.fromPluginContext(contextService);
    
    // Get selected assets
    const selection = contextService.context.activeTab.assetSelection;
    
    if (!selection || selection.length === 0) {
      showError('Geen beeld geselecteerd, selecteer minimaal 1 beeld');
      return;
    }
    
    selectedAssets = selection;
    totalCount = selectedAssets.length;
    
    introDiv!.innerHTML = `<h2>Update metadata van Axiell Collections</h2>
                           <p>${totalCount} asset(s) geselecteerd</p>`;
    
    // Start processing
    await processAssets();
    
  } catch (error: any) {
    console.error('Initialization error:', error);
    showError(`Initialization failed: ${error.message || error}`);
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
      addResult(resultList, asset.name, 'heeft geen AC record nummer', 'error');
      return;
    }
    
    // Update metadata
    const metadata = {
      cf_acStatus: 'Metadata update requested',
      cf_acTimestamp: '1970-01-01T00:00:00'
    };
    
    await apiClient.update(asset.id, {
      metadata: JSON.stringify(metadata)
    });
    
    addResult(resultList, asset.name, 'klaargezet voor metadata update', 'success');
    
  } catch (error: any) {
    console.error('Error updating asset:', error);
    const errorMsg = error.message || error.data?.message || 'Update failed';
    addResult(resultList, asset.name, errorMsg, 'error');
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
