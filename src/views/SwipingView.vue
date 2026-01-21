<template>
  <div class="swiping-view">
    <header class="app-header">
      <div class="header-content">
        <h1>💕 NostrBambino</h1>
        <div class="status-indicators">
          <span class="status-badge" :class="{ offline: !store.isOnline }">
            {{ store.isOnline ? '🟢 Online' : '🔴 Offline' }}
          </span>
          <button @click="showMatchesModal = true" class="matches-button">
            ❤️ {{ store.matches?.length || 0 }} Matches
          </button>
          <button @click="handleUnpair" class="unpair-button">
            🔓 Unpair
          </button>
        </div>
      </div>
    </header>

    <div class="swipe-container">
      <div v-if="store.currentName" class="card-stack">
        <div class="card" :key="store.currentName">
          <div class="card-content">
            <h2 class="name">{{ store.currentName }}</h2>
            <p class="stats">
              {{ store.likedNames?.length || 0 }} liked • 
              {{ store.passedNames?.length || 0 }} passed
            </p>
          </div>
        </div>
        
        <!-- Preview card behind -->
        <div v-if="store.availableNames && store.availableNames.length > 1" class="card preview-card">
          <div class="card-content">
            <h2 class="name">{{ store.availableNames[1] }}</h2>
          </div>
        </div>
      </div>

      <div v-else class="no-more-names">
        <h2>🎉 All Done!</h2>
        <p>You've reviewed all available names.</p>
        <p v-if="store.matches && store.matches.length > 0">Check your matches below!</p>
      </div>

      <div v-if="store.currentName" class="action-buttons">
        <button @click="handleSwipeLeft" class="action-button pass-button">
          <span class="button-icon">👎</span>
          <span class="button-text">Pass</span>
        </button>
        <button @click="handleSwipeRight" class="action-button like-button">
          <span class="button-icon">❤️</span>
          <span class="button-text">Like</span>
        </button>
      </div>

      <div v-if="store.pendingVotes && store.pendingVotes.length > 0" class="sync-notice">
        ⏳ {{ store.pendingVotes.length }} vote(s) pending sync
      </div>
    </div>

    <!-- Matches Modal -->
    <div v-if="showMatchesModal" class="modal-overlay" @click="showMatchesModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>❤️ Your Matches</h2>
          <button @click="showMatchesModal = false" class="close-button">×</button>
        </div>
        <div class="modal-content">
          <div v-if="!store.matches || store.matches.length === 0" class="empty-matches">
            <p>No matches yet. Keep swiping!</p>
          </div>
          <ul v-else class="matches-list">
            <li v-for="name in store.matches" :key="name" class="match-item">
              <span class="match-name">{{ name }}</span>
              <span class="match-indicator">💕</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Match Notification -->
    <transition name="match-notification">
      <div v-if="showMatchNotification" class="match-notification">
        <h3>🎉 It's a Match!</h3>
        <p>{{ lastMatch }}</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()
const showMatchesModal = ref(false)
const showMatchNotification = ref(false)
const lastMatch = ref('')

// Watch for new matches
watch(() => store.matches?.length || 0, (newLength, oldLength) => {
  if (newLength > oldLength && store.matches && store.matches.length > 0) {
    lastMatch.value = store.matches[store.matches.length - 1]
    showMatchNotification.value = true
    setTimeout(() => {
      showMatchNotification.value = false
    }, 3000)
  }
})

function handleSwipeLeft() {
  store.swipeLeft(store.currentName)
}

function handleSwipeRight() {
  store.swipeRight(store.currentName)
}

function handleUnpair() {
  if (confirm('Are you sure you want to unpair? This will clear all your data.')) {
    store.unpair()
  }
}
</script>

<style scoped>
.swiping-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 2rem;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #667eea;
}

.status-indicators {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.status-badge {
  padding: 0.5rem 1rem;
  background: #e8f5e9;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge.offline {
  background: #ffebee;
}

.matches-button,
.unpair-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s;
}

.matches-button {
  background: #ff6b9d;
  color: white;
}

.unpair-button {
  background: #f0f0f0;
  color: #666;
}

.matches-button:hover,
.unpair-button:hover {
  transform: translateY(-2px);
}

.swipe-container {
  max-width: 500px;
  margin: 3rem auto;
  padding: 0 1rem;
}

.card-stack {
  position: relative;
  height: 500px;
  margin-bottom: 2rem;
}

.card {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, opacity 0.3s;
}

.preview-card {
  transform: scale(0.95) translateY(10px);
  opacity: 0.5;
  z-index: 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.name {
  font-size: 4rem;
  margin: 0;
  color: #667eea;
  text-align: center;
}

.stats {
  margin-top: 2rem;
  color: #999;
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.action-button {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: bold;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.action-button:hover {
  transform: scale(1.1);
}

.pass-button {
  background: #ff6b6b;
  color: white;
}

.like-button {
  background: #51cf66;
  color: white;
}

.button-icon {
  font-size: 2rem;
}

.button-text {
  font-size: 0.9rem;
}

.no-more-names {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.no-more-names h2 {
  color: #667eea;
  margin-top: 0;
}

.sync-notice {
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #667eea;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
}

.empty-matches {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.matches-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.match-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}

.match-name {
  font-size: 1.2rem;
  font-weight: 500;
  color: #667eea;
}

.match-indicator {
  font-size: 1.5rem;
}

/* Match notification */
.match-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 20px;
  padding: 2rem 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
  z-index: 2000;
}

.match-notification h3 {
  margin: 0 0 0.5rem 0;
  color: #667eea;
  font-size: 2rem;
}

.match-notification p {
  margin: 0;
  font-size: 1.5rem;
  color: #ff6b9d;
  font-weight: bold;
}

.match-notification-enter-active,
.match-notification-leave-active {
  transition: all 0.3s;
}

.match-notification-enter-from,
.match-notification-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

@media (max-width: 600px) {
  .name {
    font-size: 3rem;
  }
  
  .action-button {
    width: 80px;
    height: 80px;
  }
  
  .button-icon {
    font-size: 1.5rem;
  }
  
  .card-stack {
    height: 400px;
  }
}
</style>
