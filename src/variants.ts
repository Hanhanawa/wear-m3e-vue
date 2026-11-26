import { defineComponent, h, type Component } from "vue";

export function variant<ComponentType extends Component>(
  component: ComponentType,
  name: string,
  defaults: Record<string, unknown>,
): ComponentType {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h(component, { ...defaults, ...attrs }, slots);
    },
  }) as unknown as ComponentType;
}
