<script setup lang="ts">
defineProps<{ label: string }>();

function key(event: KeyboardEvent) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  const element = event.currentTarget as HTMLElement;
  const options = Array.from(
    element.querySelectorAll<HTMLElement>('[role="listbox"][tabindex="0"]'),
  );
  const index = options.indexOf(event.target as HTMLElement);
  if (index < 0) return;
  const sign = getComputedStyle(element).direction === "rtl" ? -1 : 1;
  const next = options[index + (event.key === "ArrowRight" ? sign : -sign)];
  if (next) {
    event.preventDefault();
    next.focus({ preventScroll: true });
  }
}
</script>

<template>
  <div
    class="wear-picker-group"
    role="group"
    :aria-label="label"
    @keydown="key"
  >
    <slot />
  </div>
</template>
