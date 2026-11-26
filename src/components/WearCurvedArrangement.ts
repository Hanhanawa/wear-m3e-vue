import { Comment, Fragment, defineComponent, h, inject, type VNode } from "vue";
import { curvedKey } from "../curved";
import WearCurvedBox from "./WearCurvedBox.vue";

function children(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Comment) return [];
    if (node.type === Fragment && Array.isArray(node.children))
      return children(node.children as VNode[]);
    return [node];
  });
}

export default defineComponent({
  name: "WearCurvedArrangement",
  props: {
    radial: Boolean,
    radius: Number,
    angle: Number,
    spacing: { type: Number, default: 20 },
    size: { type: Number, default: 24 },
    rotate: Boolean,
  },
  setup(props, { slots }) {
    const parent = inject(curvedKey, null);
    return () => {
      const content = children(slots.default?.() ?? []);
      const radius = props.radius ?? parent?.radius() ?? 102;
      const angle = props.angle ?? parent?.angle() ?? 0;
      return h(
        "div",
        { class: "wear-curved-arrangement" },
        content.map((node, index) =>
          h(
            WearCurvedBox,
            {
              key: node.key ?? index,
              radius: props.radial ? radius - index * props.spacing : radius,
              angle: props.radial
                ? angle
                : angle + (index - (content.length - 1) / 2) * props.spacing,
              size: props.size,
              rotate: props.rotate,
            },
            { default: () => node },
          ),
        ),
      );
    };
  },
});
