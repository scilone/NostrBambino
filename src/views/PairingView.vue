<template>
  <div class="pairing-view">
    <div class="logo">
      <h1>💕 NostrBambino</h1>
      <p class="tagline">Find the perfect name together</p>
    </div>
    
    <div class="pairing-card">
      <h2>Connect with Your Partner</h2>
      <p class="instruction">Enter a shared secret that both of you know. This creates a private connection without requiring login.</p>
      
      <form @submit.prevent="handlePair">
        <div class="input-group">
          <input 
            v-model="secret" 
            type="text" 
            placeholder="Enter shared secret..."
            class="secret-input"
            required
          />
        </div>
        
        <button type="submit" class="pair-button" :disabled="!secret.trim()">
          Start Swiping
        </button>
      </form>
      
      <div class="info">
        <p>💡 <strong>Tips:</strong></p>
        <ul>
          <li>Choose something only you two know</li>
          <li>Use the same secret on both devices</li>
          <li>Works offline - syncs when connected</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()
const secret = ref('')

function handlePair() {
  if (secret.value.trim()) {
    store.setSharedSecret(secret.value)
  }
}
</script>

<style scoped>
.pairing-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.logo {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.logo h1 {
  font-size: 3rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.tagline {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-top: 0.5rem;
}

.pairing-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.pairing-card h2 {
  margin-top: 0;
  color: #667eea;
}

.instruction {
  color: #666;
  margin-bottom: 1.5rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.secret-input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.secret-input:focus {
  outline: none;
  border-color: #667eea;
}

.pair-button {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pair-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.pair-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 10px;
  font-size: 0.9rem;
}

.info ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.info li {
  margin: 0.3rem 0;
}

@media (max-width: 600px) {
  .logo h1 {
    font-size: 2rem;
  }
  
  .pairing-card {
    padding: 1.5rem;
  }
}
</style>
