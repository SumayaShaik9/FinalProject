// stores/userStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(null)
  const isLoggedIn = ref(false)
  const errorMessage = ref('')

  const genderOptions = ['Male', 'Female', 'Prefer not to say']
  // State
  const tags = ref([])
  const contexts = ref([])
  const languages = ref([])
  const showSearchDialog = ref(false);
  const showSearchResults = ref(false);
  const filteredIdenitities = ref([]);

  // Fetch functions
  const fetchTags = async () => {
    try {
      const response = await axios.get('http://localhost:3000/tags', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      tags.value = response.data
    } catch (err) {
      console.error('Failed to fetch tags:', err.response?.data || err.message)
    }
  }

  const fetchContexts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/contexts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      contexts.value = response.data
    } catch (err) {
      console.error('Failed to fetch contexts:', err.response?.data || err.message)
    }
  }

  const fetchLanguages = async () => {
    try {
      const response = await axios.get('http://localhost:3000/users/languages', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      languages.value = response.data
    } catch (err) {
      console.error('Failed to fetch languages:', err.response?.data || err.message)
    }
  }

  // Combined fetch
  const fetchAllMeta = async () => {
    await Promise.all([fetchTags(), fetchContexts(), fetchLanguages()])
  }

  return {
    user,
    token,
    isLoggedIn,
    errorMessage,
    genderOptions,
    tags,
    contexts,
    languages,
    showSearchDialog,
    showSearchResults,
    filteredIdenitities,
    fetchTags,
    fetchContexts,
    fetchLanguages,
    fetchAllMeta
  }
})
