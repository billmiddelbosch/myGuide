<script setup>
import { ref } from 'vue'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  paymentReturned: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['donate', 'skip'])

const amount = ref(5)

const handleDonate = () => {
  if (amount.value >= 1) {
    emit('donate', amount.value)
  }
}
</script>

<template>
  <div class="donation-screen">
    <!-- Payment returned message -->
    <template v-if="paymentReturned">
      <div class="returned-container">
        <div class="returned-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="returned-title">Bedankt voor je steun!</h1>
        <p class="returned-subtitle">
          Je bijdrage helpt ons om cityCast te blijven verbeteren.
        </p>
        <button class="btn-continue" @click="emit('skip')">
          Doorgaan
        </button>
      </div>
    </template>

    <!-- Donation form -->
    <template v-else>
      <div class="donation-header">
        <div class="donation-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h1 class="donation-title">Leuk dat je de tour hebt gedaan!</h1>
        <p class="donation-subtitle">
          Als het je beviel, kun je ons steunen met een kleine bijdrage. Helemaal vrijblijvend.
        </p>
      </div>

      <div class="amount-section">
        <label for="donationAmount" class="amount-label">Bedrag</label>
        <div class="amount-input-wrapper">
          <span class="currency-symbol">&euro;</span>
          <input
            id="donationAmount"
            v-model.number="amount"
            type="number"
            min="1"
            step="1"
            placeholder="5"
            class="amount-input"
          />
        </div>
        <p v-if="amount < 1 && amount !== null" class="error-text">Minimaal &euro;1</p>
      </div>

      <div class="donation-actions">
        <button
          class="btn-donate"
          :disabled="isLoading || amount < 1"
          @click="handleDonate"
        >
          <template v-if="isLoading">
            <svg class="spinner" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            Doorsturen...
          </template>
          <template v-else>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
              />
            </svg>
            Steun cityCast
          </template>
        </button>

        <button
          class="btn-skip"
          :disabled="isLoading"
          @click="emit('skip')"
        >
          Overslaan
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.donation-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: linear-gradient(180deg, var(--color-neutral-50) 0%, white 100%);
  position: relative;
}

.donation-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  text-align: center;
  animation: fade-up 0.5s ease-out;
}

.donation-icon {
  width: 5rem;
  height: 5rem;
  color: #f472b6;
  animation: pop-in 0.5s ease-out;
}

.donation-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes pop-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.donation-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  letter-spacing: -0.02em;
  animation: fade-up 0.5s ease-out 0.2s both;
}

.donation-subtitle {
  font-size: 1rem;
  color: var(--color-neutral-500);
  max-width: 320px;
  line-height: 1.5;
  animation: fade-up 0.5s ease-out 0.3s both;
}

.amount-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
  animation: fade-up 0.5s ease-out 0.4s both;
}

.amount-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-600);
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid var(--color-neutral-200);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.amount-input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.currency-symbol {
  padding: 0.875rem 0 0.875rem 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-neutral-500);
}

.amount-input {
  flex: 1;
  padding: 0.875rem 1rem 0.875rem 0.5rem;
  border: none;
  font-family: inherit;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  outline: none;
  background: transparent;
  -moz-appearance: textfield;
}

.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.amount-input::placeholder {
  color: var(--color-neutral-400);
  font-weight: 400;
}

.error-text {
  font-size: 0.75rem;
  color: #ef4444;
}

.donation-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
  animation: fade-up 0.5s ease-out 0.5s both;
}

.btn-donate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.btn-donate:hover:not(:disabled) {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

.btn-donate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-donate svg {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-skip {
  background: none;
  border: none;
  color: var(--color-neutral-400);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: color 0.2s ease;
}

.btn-skip:hover:not(:disabled) {
  color: var(--color-neutral-600);
}

.btn-skip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Payment returned state */
.returned-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  gap: 1rem;
  animation: fade-up 0.5s ease-out;
}

.returned-icon {
  width: 6rem;
  height: 6rem;
  color: var(--color-primary);
  animation: pop-in 0.5s ease-out;
}

.returned-icon svg {
  width: 100%;
  height: 100%;
}

.returned-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  letter-spacing: -0.02em;
}

.returned-subtitle {
  font-size: 1rem;
  color: var(--color-neutral-500);
  max-width: 280px;
}

.btn-continue {
  margin-top: 1.5rem;
  padding: 1rem 2rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.btn-continue:hover {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .donation-screen {
    background: linear-gradient(180deg, var(--color-neutral-900) 0%, var(--color-neutral-800) 100%);
  }

  .donation-title,
  .returned-title {
    color: var(--color-neutral-50);
  }

  .donation-subtitle,
  .returned-subtitle {
    color: var(--color-neutral-400);
  }

  .amount-label {
    color: var(--color-neutral-300);
  }

  .amount-input-wrapper {
    border-color: var(--color-neutral-700);
    background: var(--color-neutral-800);
  }

  .currency-symbol {
    color: var(--color-neutral-400);
  }

  .amount-input {
    color: var(--color-neutral-200);
  }

  .amount-input::placeholder {
    color: var(--color-neutral-500);
  }

  .btn-skip {
    color: var(--color-neutral-500);
  }

  .btn-skip:hover:not(:disabled) {
    color: var(--color-neutral-300);
  }
}
</style>
