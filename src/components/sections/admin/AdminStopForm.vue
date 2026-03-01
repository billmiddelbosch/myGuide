<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  cities: { type: Array, required: true },
  poiCategories: { type: Array, required: true },
  commercialStops: { type: Array, required: true }
})

const emit = defineEmits(['save', 'delete'])

// Form state
const form = ref({
  cityId: '',
  name: '',
  description: '',
  categoryId: '',
  lat: '',
  lng: ''
})

const editingId = ref(null)
const deleteConfirmId = ref(null)

// Group stops by city
const stopsByCity = computed(() => {
  const groups = {}
  props.commercialStops.forEach(stop => {
    if (!groups[stop.cityId]) {
      groups[stop.cityId] = { cityName: stop.cityName, stops: [] }
    }
    groups[stop.cityId].stops.push(stop)
  })
  return groups
})

const hasCitySelected = computed(() => !!form.value.cityId)

const resetForm = () => {
  form.value = { cityId: '', name: '', description: '', categoryId: '', lat: '', lng: '' }
  editingId.value = null
}

const handleEdit = (stop) => {
  editingId.value = stop.id
  form.value = {
    cityId: stop.cityId,
    name: stop.name || '',
    description: stop.description || '',
    categoryId: stop.categoryId || '',
    lat: stop.lat?.toString() || '',
    lng: stop.lng?.toString() || ''
  }
}

const handleSave = () => {
  const stop = {
    ...(editingId.value ? { id: editingId.value } : {}),
    cityId: form.value.cityId,
    cityName: props.cities.find(c => c.id === form.value.cityId)?.name || '',
    name: form.value.name || undefined,
    description: form.value.description || undefined,
    categoryId: form.value.categoryId || undefined,
    categoryName: props.poiCategories.find(c => c.id === form.value.categoryId)?.name || undefined,
    lat: form.value.lat ? parseFloat(form.value.lat) : undefined,
    lng: form.value.lng ? parseFloat(form.value.lng) : undefined
  }
  emit('save', stop)
  resetForm()
}

const handleDelete = (id) => {
  if (deleteConfirmId.value === id) {
    emit('delete', id)
    deleteConfirmId.value = null
  } else {
    deleteConfirmId.value = id
  }
}

const getCategoryColor = (categoryId) => {
  return props.poiCategories.find(c => c.id === categoryId)?.color || '#94a3b8'
}
</script>

<template>
  <div class="stops-tab">

    <!-- Add / Edit Form -->
    <div class="section-card stop-form">
      <div class="section-header">
        <h2 class="section-title">
          {{ editingId ? 'Stop bewerken' : 'Nieuwe commerciële stop' }}
        </h2>
        <button v-if="editingId" class="cancel-btn" @click="resetForm">
          Annuleren
        </button>
      </div>

      <div class="form-grid">
        <!-- City (required) -->
        <div class="form-field form-field--full">
          <label class="field-label">
            Stad
            <span class="required">vereist</span>
          </label>
          <select v-model="form.cityId" class="field-select">
            <option value="">Selecteer een stad</option>
            <option v-for="city in cities" :key="city.id" :value="city.id">
              {{ city.name }}
            </option>
          </select>
        </div>

        <!-- Name -->
        <div class="form-field form-field--full">
          <label class="field-label">
            Naam
            <span class="optional">optioneel</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="field-input"
            placeholder="bijv. Heineken Experience"
          />
        </div>

        <!-- Description -->
        <div class="form-field form-field--full">
          <label class="field-label">
            Beschrijving
            <span class="optional">optioneel</span>
          </label>
          <textarea
            v-model="form.description"
            class="field-textarea"
            placeholder="Korte omschrijving van de stop..."
            rows="3"
          />
        </div>

        <!-- Category -->
        <div class="form-field">
          <label class="field-label">
            Categorie
            <span class="optional">optioneel</span>
          </label>
          <select v-model="form.categoryId" class="field-select">
            <option value="">Geen categorie</option>
            <option v-for="cat in poiCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Coordinates -->
        <div class="form-field">
          <label class="field-label">
            Coördinaten
            <span class="optional">optioneel</span>
          </label>
          <div class="coords-row">
            <input
              v-model="form.lat"
              type="number"
              class="field-input mono"
              placeholder="Breedtegraad"
              step="0.000001"
            />
            <input
              v-model="form.lng"
              type="number"
              class="field-input mono"
              placeholder="Lengtegraad"
              step="0.000001"
            />
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button class="save-btn" :disabled="!hasCitySelected" @click="handleSave">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ editingId ? 'Wijzigingen opslaan' : 'Stop toevoegen' }}
        </button>
      </div>
    </div>

    <!-- Stops List -->
    <div v-if="commercialStops.length > 0" class="section-card stops-list">
      <h2 class="section-title">
        Bestaande stops
        <span class="title-count">{{ commercialStops.length }}</span>
      </h2>

      <div v-for="(group, cityId) in stopsByCity" :key="cityId" class="city-group">
        <div class="city-group-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {{ group.cityName }}
          <span class="city-count">{{ group.stops.length }}</span>
        </div>

        <div class="stop-rows">
          <div v-for="stop in group.stops" :key="stop.id" class="stop-row">
            <div class="stop-row-info">
              <span class="stop-row-name">{{ stop.name || '—' }}</span>
              <div class="stop-row-meta">
                <span
                  v-if="stop.categoryId"
                  class="category-chip"
                  :style="{ background: getCategoryColor(stop.categoryId) + '22', color: getCategoryColor(stop.categoryId) }"
                >
                  {{ stop.categoryName }}
                </span>
                <span v-if="stop.lat && stop.lng" class="coords-chip">
                  {{ stop.lat.toFixed(4) }}, {{ stop.lng.toFixed(4) }}
                </span>
              </div>
            </div>
            <div class="stop-row-actions">
              <button class="row-btn row-btn--edit" @click="handleEdit(stop)" title="Bewerken">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                class="row-btn"
                :class="deleteConfirmId === stop.id ? 'row-btn--confirm' : 'row-btn--delete'"
                @click="handleDelete(stop.id)"
                :title="deleteConfirmId === stop.id ? 'Klik nogmaals om te verwijderen' : 'Verwijderen'"
              >
                <svg v-if="deleteConfirmId !== stop.id" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <p>Nog geen commerciële stops toegevoegd</p>
    </div>

  </div>
</template>

<style scoped>
.stops-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Cards ── */
.section-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid var(--color-neutral-100);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.title-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.375rem;
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-mono);
  border-radius: 6rem;
}

.cancel-btn {
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid var(--color-neutral-200);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-neutral-500);
  cursor: pointer;
  transition: all 0.15s ease;
}

.cancel-btn:hover {
  background: var(--color-neutral-50);
  color: var(--color-neutral-700);
}

/* ── Form ── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field--full {
  grid-column: 1 / -1;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  margin-bottom: 0.375rem;
}

.optional {
  font-size: 0.6875rem;
  font-weight: 400;
  color: var(--color-neutral-400);
  font-family: var(--font-mono);
}

.required {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-primary);
  font-family: var(--font-mono);
}

.field-input,
.field-select,
.field-textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1.5px solid var(--color-neutral-200);
  border-radius: 0.625rem;
  font-size: 0.875rem;
  color: var(--color-neutral-900);
  background: var(--color-neutral-50);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  font-family: var(--font-body);
  box-sizing: border-box;
}

.field-input.mono {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

.field-input:focus,
.field-select:focus,
.field-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.12);
  background: white;
}

.field-textarea {
  resize: vertical;
  min-height: 5rem;
  line-height: 1.5;
}

.coords-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.form-footer {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-neutral-100);
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--color-primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 0.625rem;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.save-btn:hover:not(:disabled) {
  background: var(--color-primary-600);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.save-btn svg {
  width: 1rem;
  height: 1rem;
}

/* ── Stops List ── */
.city-group {
  margin-bottom: 1.25rem;
}

.city-group:last-child {
  margin-bottom: 0;
}

.city-group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 0 0.625rem 0;
  border-bottom: 1px solid var(--color-neutral-100);
  margin-bottom: 0.625rem;
}

.city-group-header svg {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.city-count {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  background: var(--color-neutral-100);
  color: var(--color-neutral-500);
  padding: 0.125rem 0.375rem;
  border-radius: 6rem;
}

.stop-rows {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.stop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 0.75rem;
  background: var(--color-neutral-50);
  border-radius: 0.625rem;
  border: 1px solid transparent;
  transition: border-color 0.15s ease;
}

.stop-row:hover {
  border-color: var(--color-neutral-200);
}

.stop-row-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.stop-row-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stop-row-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 6rem;
  font-size: 0.6875rem;
  font-weight: 600;
}

.coords-chip {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-neutral-400);
}

.stop-row-actions {
  display: flex;
  gap: 0.375rem;
  flex-shrink: 0;
}

.row-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.row-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

.row-btn--edit {
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
}

.row-btn--edit:hover {
  background: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

.row-btn--delete {
  background: #fee2e2;
  color: #dc2626;
}

.row-btn--delete:hover {
  background: #fecaca;
}

.row-btn--confirm {
  background: #dc2626;
  color: white;
}

.row-btn--confirm:hover {
  background: #b91c1c;
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  color: var(--color-neutral-400);
  text-align: center;
}

.empty-state svg {
  width: 2.5rem;
  height: 2.5rem;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .section-card {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
  }

  .section-title,
  .stop-row-name {
    color: var(--color-neutral-900);
  }

  .field-input,
  .field-select,
  .field-textarea {
    background: var(--color-neutral-200);
    border-color: var(--color-neutral-300);
    color: var(--color-neutral-900);
  }

  .field-input:focus,
  .field-select:focus,
  .field-textarea:focus {
    background: var(--color-neutral-100);
  }

  .stop-row {
    background: var(--color-neutral-200);
  }

  .row-btn--edit {
    background: var(--color-neutral-300);
    color: var(--color-neutral-600);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-field--full {
    grid-column: 1;
  }

  .coords-row {
    grid-template-columns: 1fr;
  }
}
</style>
