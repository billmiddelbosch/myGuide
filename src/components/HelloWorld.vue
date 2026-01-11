<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api.js';

const items = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchItems = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.gettourTypes();
    items.value = response.data;
  } catch (err) {
    error.value = err.message;
    console.error('Error fetching items:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchItems();
});
</script>

<template>
  <div>
    <h1>Items</h1>
    
    <div v-if="loading">Loading...</div>
    <div v-if="error">Error: {{ error }}</div>
    
    <ul v-if="!loading && !error">
      <li v-for="item in items.body" :key="item.id">
        {{ item.typeName }}
      </li>
    </ul>
  </div>
</template>