<script setup>
// Props
const props = defineProps({
  testimonial: {
    type: Object,
    required: true
  }
})

// Format date to relative or formatted string
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 7) {
    return `${diffDays} dagen geleden`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weken'} geleden`
  } else {
    return date.toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })
  }
}

// Get initials from name
const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>

<template>
  <div class="testimonial-card">
    <!-- Quote icon -->
    <div class="quote-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
    </div>

    <!-- Quote -->
    <blockquote class="testimonial-quote">
      {{ testimonial.review }}
    </blockquote>

    <!-- Rating -->
    <div class="rating-stars">
      <svg
        v-for="i in 5"
        :key="i"
        class="star"
        :class="{ filled: i <= testimonial.rating }"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>

    <!-- Author -->
    <div class="testimonial-author">
      <div class="author-avatar" v-if="testimonial.userAvatar">
        <img :src="testimonial.userAvatar" :alt="testimonial.userName" />
      </div>
      <div class="author-avatar author-initials" v-else>
        {{ getInitials(testimonial.userName) }}
      </div>
      <div class="author-info">
        <span class="author-name">{{ testimonial.userName }}</span>
        <span class="author-meta">
          {{ testimonial.tourCity }} &middot; {{ testimonial.tourDuration }} &middot; {{ testimonial.tourStopCount }} stops
        </span>
      </div>
    </div>

    <!-- Date badge -->
    <div class="date-badge">
      {{ formatDate(testimonial.date) }}
    </div>
  </div>
</template>

<style scoped>
.testimonial-card {
  position: relative;
  padding: 1.75rem;
  background: var(--color-neutral-50);
  border-radius: 1.25rem;
  border: 1px solid var(--color-neutral-100);
  transition: all 0.2s ease;
}

.testimonial-card:hover {
  border-color: var(--color-neutral-200);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.quote-icon {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 2rem;
  height: 2rem;
  color: var(--color-primary-100);
}

.quote-icon svg {
  width: 100%;
  height: 100%;
}

.testimonial-quote {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-neutral-700);
  margin: 0 0 1rem 0;
  padding-right: 2rem;
}

.rating-stars {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
}

.star {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--color-neutral-200);
}

.star.filled {
  color: var(--color-secondary);
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-primary-600) 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.author-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.author-meta {
  font-size: 0.8125rem;
  color: var(--color-neutral-500);
}

.date-badge {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.75rem;
  color: var(--color-neutral-400);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .testimonial-card {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
  }

  .testimonial-card:hover {
    border-color: var(--color-neutral-300);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .quote-icon {
    color: rgba(20, 184, 166, 0.2);
  }

  .testimonial-quote {
    color: var(--color-neutral-600);
  }

  .star {
    color: var(--color-neutral-300);
  }

  .author-name {
    color: var(--color-neutral-900);
  }

  .author-meta {
    color: var(--color-neutral-500);
  }

  .date-badge {
    color: var(--color-neutral-400);
  }
}

/* Tablet and up */
@media (min-width: 768px) {
  .testimonial-card {
    padding: 2rem;
  }

  .testimonial-quote {
    font-size: 1.0625rem;
  }
}
</style>
