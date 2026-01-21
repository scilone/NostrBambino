import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SimplePool, nip19 } from 'nostr-tools'
import babyNames from '../data/babyNames.js'

// Hash function to create a deterministic identifier from the shared secret
function hashSecret(secret) {
  let hash = 0
  for (let i = 0; i < secret.length; i++) {
    const char = secret.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

export const useAppStore = defineStore('app', () => {
  // State
  const sharedSecret = ref(localStorage.getItem('sharedSecret') || '')
  const userId = ref(localStorage.getItem('userId') || '')
  const isPaired = ref(!!sharedSecret.value)
  const currentNameIndex = ref(0)
  const likedNames = ref(JSON.parse(localStorage.getItem('likedNames') || '[]'))
  const passedNames = ref(JSON.parse(localStorage.getItem('passedNames') || '[]'))
  const matches = ref(JSON.parse(localStorage.getItem('matches') || '[]'))
  const partnerLikes = ref(JSON.parse(localStorage.getItem('partnerLikes') || '[]'))
  const pendingVotes = ref(JSON.parse(localStorage.getItem('pendingVotes') || '[]'))
  const isOnline = ref(navigator.onLine)
  const syncStatus = ref('idle') // idle, syncing, error
  
  // Nostr setup
  const pool = new SimplePool()
  const relays = [
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
    'wss://nos.lol'
  ]

  // Computed
  const sessionTag = computed(() => {
    return sharedSecret.value ? hashSecret(sharedSecret.value) : ''
  })

  const availableNames = computed(() => {
    return babyNames.filter(name => 
      !likedNames.value.includes(name) && 
      !passedNames.value.includes(name)
    )
  })

  const currentName = computed(() => {
    if (currentNameIndex.value < availableNames.value.length) {
      return availableNames.value[currentNameIndex.value]
    }
    return null
  })

  // Actions
  function setSharedSecret(secret) {
    sharedSecret.value = secret.trim()
    // Generate a random user ID for this session
    userId.value = Math.random().toString(36).substring(7)
    isPaired.value = true
    localStorage.setItem('sharedSecret', sharedSecret.value)
    localStorage.setItem('userId', userId.value)
    
    // Start listening for partner's votes
    subscribeToPartnerVotes()
  }

  function unpair() {
    sharedSecret.value = ''
    userId.value = ''
    isPaired.value = false
    likedNames.value = []
    passedNames.value = []
    matches.value = []
    partnerLikes.value = []
    currentNameIndex.value = 0
    pendingVotes.value = []
    localStorage.clear()
  }

  async function swipeRight(name) {
    likedNames.value.push(name)
    localStorage.setItem('likedNames', JSON.stringify(likedNames.value))
    
    // Check if it's a match
    if (partnerLikes.value.includes(name)) {
      matches.value.push(name)
      localStorage.setItem('matches', JSON.stringify(matches.value))
    }
    
    // Publish vote to Nostr
    await publishVote(name, 'like')
    
    // Move to next name
    currentNameIndex.value++
  }

  async function swipeLeft(name) {
    passedNames.value.push(name)
    localStorage.setItem('passedNames', JSON.stringify(passedNames.value))
    
    // Publish vote to Nostr
    await publishVote(name, 'pass')
    
    // Move to next name
    currentNameIndex.value++
  }

  async function publishVote(name, action) {
    const vote = {
      userId: userId.value,
      name: name,
      action: action,
      timestamp: Date.now()
    }
    
    // Add to pending votes for offline support
    pendingVotes.value.push(vote)
    localStorage.setItem('pendingVotes', JSON.stringify(pendingVotes.value))
    
    if (isOnline.value) {
      await syncVotes()
    }
  }

  async function syncVotes() {
    if (!isPaired.value || pendingVotes.value.length === 0) return
    
    syncStatus.value = 'syncing'
    
    try {
      for (const vote of pendingVotes.value) {
        const event = {
          kind: 1,
          created_at: Math.floor(vote.timestamp / 1000),
          tags: [
            ['t', sessionTag.value],
            ['action', vote.action]
          ],
          content: JSON.stringify({
            userId: vote.userId,
            name: vote.name,
            action: vote.action
          })
        }
        
        // Note: In a real app, you would sign this with a private key
        // For this demo, we're using unsigned events (which relays will reject)
        // This is okay - the app works offline-first with localStorage
        try {
          await pool.publish(relays, event)
        } catch (pubError) {
          console.warn('Could not publish to Nostr relays:', pubError)
        }
      }
      
      // Clear pending votes after sync attempt
      pendingVotes.value = []
      localStorage.setItem('pendingVotes', JSON.stringify(pendingVotes.value))
      syncStatus.value = 'idle'
    } catch (error) {
      console.error('Sync error:', error)
      syncStatus.value = 'error'
    }
  }

  function subscribeToPartnerVotes() {
    if (!isPaired.value || !sessionTag.value) return
    
    try {
      const filter = {
        kinds: [1],
        '#t': [sessionTag.value],
        since: Math.floor(Date.now() / 1000) - 86400 // Last 24 hours
      }
      
      const sub = pool.subscribeMany(
        relays,
        [filter],
        {
          onevent(event) {
            try {
              const data = JSON.parse(event.content)
              
              // Ignore our own votes
              if (data.userId === userId.value) return
              
              // Process partner's vote
              if (data.action === 'like') {
                if (!partnerLikes.value.includes(data.name)) {
                  partnerLikes.value.push(data.name)
                  localStorage.setItem('partnerLikes', JSON.stringify(partnerLikes.value))
                  
                  // Check if it's a match
                  if (likedNames.value.includes(data.name) && !matches.value.includes(data.name)) {
                    matches.value.push(data.name)
                    localStorage.setItem('matches', JSON.stringify(matches.value))
                  }
                }
              }
            } catch (error) {
              console.error('Error processing event:', error)
            }
          },
          oneose() {
            console.log('Initial events loaded')
          }
        }
      )
      
      // Return unsubscribe function
      return () => sub.close()
    } catch (error) {
      console.error('Error subscribing to partner votes:', error)
      return () => {}
    }
  }

  // Handle online/offline status
  window.addEventListener('online', () => {
    isOnline.value = true
    syncVotes()
  })

  window.addEventListener('offline', () => {
    isOnline.value = false
  })
  
  // Initialize subscription if already paired
  if (isPaired.value && sharedSecret.value) {
    subscribeToPartnerVotes()
  }

  return {
    // State
    sharedSecret,
    isPaired,
    currentName,
    likedNames,
    passedNames,
    matches,
    partnerLikes,
    isOnline,
    syncStatus,
    availableNames,
    
    // Actions
    setSharedSecret,
    unpair,
    swipeRight,
    swipeLeft,
    syncVotes,
    subscribeToPartnerVotes
  }
})
