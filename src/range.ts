import { computed, type Ref } from "vue";
import { rangeValue } from "./values";

export function useWearRange(
  props: { min?: number; max?: number; step?: number },
  model: Ref<number | undefined>,
) {
  const min = computed(() => (Number.isFinite(props.min) ? props.min! : 0));
  const max = computed(() =>
    Number.isFinite(props.max)
      ? Math.max(min.value, props.max!)
      : Math.max(min.value, 100),
  );
  const step = computed(() =>
    Number.isFinite(props.step) && props.step! > 0 ? props.step! : 1,
  );
  const value = computed(() =>
    rangeValue(model.value, min.value, max.value, step.value),
  );
  const ratio = computed(() =>
    max.value === min.value
      ? 0
      : (value.value - min.value) / (max.value - min.value),
  );
  function change(next: number) {
    model.value = rangeValue(next, min.value, max.value, step.value);
  }
  return { min, max, step, value, ratio, change };
}
