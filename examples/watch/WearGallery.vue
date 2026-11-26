<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import {
  WearScaffold,
  WearMaterialTheme,
  WearTimeText,
  WearScreenScaffold,
  WearList,
  WearListItem,
  WearListHeader,
  WearListSubHeader,
  WearButton,
  WearFilledTonalButton,
  WearOutlinedButton,
  WearChildButton,
  WearCompactButton,
  WearButtonGroup,
  WearIconButton,
  WearFilledIconButton,
  WearFilledTonalIconButton,
  WearOutlinedIconButton,
  WearTextButton,
  WearEdgeButton,
  WearIconToggleButton,
  WearTextToggleButton,
  WearSwitchButton,
  WearSplitSwitchButton,
  WearCheckboxButton,
  WearSplitCheckboxButton,
  WearRadioButton,
  WearSplitRadioButton,
  WearRadioGroup,
  WearCard,
  WearAppCard,
  WearTitleCard,
  WearOutlinedCard,
  WearText,
  WearIcon,
  WearAnimatedText,
  WearFadingExpandingLabel,
  WearPlaceholder,
  WearExpandableItem,
  WearSlider,
  WearStepper,
  WearCircularProgressIndicator,
  WearLinearProgressIndicator,
  WearSegmentedCircularProgressIndicator,
  WearArcProgressIndicator,
  WearLevelIndicator,
  WearPicker,
  WearPickerGroup,
  WearDatePicker,
  WearTimePicker,
  WearDurationPicker,
  WearAlertDialog,
  WearDialog,
  WearPickerScreen,
  WearConfirmationDialog,
  WearSuccessConfirmationDialog,
  WearFailureConfirmationDialog,
  WearOpenOnPhoneDialog,
  WearHorizontalPagerScaffold,
  WearVerticalPagerScaffold,
  WearAnimatedPage,
  WearTransformingLazyColumn,
  WearSwipeToReveal,
  WearNavigation,
  WearPullToRefresh,
  WearAmbientMode,
  WearOneHandedGesture,
  WearCurvedLayout,
  WearCurvedText,
  dispatchWearGesture,
  WearCurvedRow,
  WearOneHandedGestureClickIndicator,
  type WearNavigationEntry,
} from "wear-m3e-vue";

const query = new URLSearchParams(location.search);
const categories = [
  ["buttons", "Buttons", "Actions & shapes"],
  ["selection", "Selection", "Switches, checks, radios"],
  ["cards", "Cards", "App, title & outlined"],
  ["slider", "Adjust", "Slider & stepper"],
  ["progress", "Progress", "Rings, arcs & levels"],
  ["pickers", "Pickers", "Date, time & duration"],
  ["dialogs", "Dialogs", "Confirm & communicate"],
  ["horizontal", "Horizontal pages", "Swipe between pages"],
  ["vertical", "Vertical pages", "Swipe up and down"],
  ["lazy", "Long lists", "200 measured rows"],
  ["gestures", "Gestures", "Reveal, expand, refresh"],
  ["type", "Text & ambient", "Curved type & animation"],
];
const initial = query.get("section");
const stack = ref<WearNavigationEntry[]>([
  { id: "menu", route: "menu", label: "Component catalog" },
]);
if (initial && categories.some(([route]) => route === initial))
  stack.value.push({ id: initial, route: initial, label: initial });
const buttonCount = ref(0);
const enabled = ref(true);
const checked = ref(false);
const splitEnabled = ref(false);
const splitChecked = ref(true);
const selected = ref<string | number>("balanced");
const details = ref(0);
const toggle = ref(false);
const slider = ref(40);
const stepper = ref(3);
const picker = ref<string | number>(2);
const secondPicker = ref<string | number>("min");
const date = ref("2024-01-31");
const time = ref("23:58:30");
const duration = ref(3661);
const dialog = ref("");
const confirmed = ref(0);
const horizontal = ref(0);
const vertical = ref(0);
const expanded = ref(false);
const revealed = ref(false);
const removed = ref(false);
const refresh = ref(false);
const refreshes = ref(0);
const ambient = ref(false);
const timer = ref(0);
const count = ref(72);
const gesture = ref<HTMLElement>();
const hints = ref(0);
const loading = ref(true);
const lazy = ref<{ scrollToIndex: (index: number) => void }>();
const rows = Array.from({ length: 200 }, (_, index) => ({
  id: index,
  name: `Record ${index + 1}`,
  detail:
    index % 3 === 0
      ? "Variable height content on a circular watch screen"
      : "Ready",
}));
const pages = [
  { id: "first", label: "First" },
  { id: "second", label: "Second" },
  { id: "third", label: "Third" },
];
const settings = computed(() => ({
  enabled: enabled.value,
  checked: checked.value,
  splitEnabled: splitEnabled.value,
  selected: selected.value,
  details: details.value,
}));
function navigate(route: string, label: string) {
  stack.value.push({ id: `${route}-${stack.value.length}`, route, label });
}
function finishRefresh() {
  window.clearTimeout(timer.value);
  timer.value = window.setTimeout(() => {
    refresh.value = false;
    refreshes.value += 1;
  }, 500);
}
function stimulate() {
  if (gesture.value) dispatchWearGesture(gesture.value, "click");
}
function previewAmbient() {
  ambient.value = true;
  window.clearTimeout(timer.value);
  timer.value = window.setTimeout(() => {
    ambient.value = false;
  }, 1500);
}
onUnmounted(() => window.clearTimeout(timer.value));
</script>

<template>
  <WearMaterialTheme
    :colors="{
      primary: '#c4ec72',
      onPrimary: '#253500',
      primaryContainer: '#344b10',
      onPrimaryContainer: '#e1f8b4',
    }"
  >
    <WearScaffold
      :round="query.get('round') !== 'false'"
      :host-scale="Number(query.get('scale')) || 1"
      :font-scale="Number(query.get('text')) || 1"
      :dir="query.get('dir') === 'rtl' ? 'rtl' : 'ltr'"
      :ambient="ambient"
    >
      <template #time
        ><WearTimeText
          :date="new Date('2026-11-25T21:06:00')"
          hour-cycle="h23"
          scroll-away
      /></template>
      <WearNavigation v-model="stack">
        <template #menu>
          <WearScreenScaffold>
            <WearList label="Components">
              <WearListItem
                ><WearListHeader :level="1"
                  >Wear M3E</WearListHeader
                ></WearListItem
              >
              <WearListItem
                v-for="[route, label, detail] in categories"
                :key="route"
                effect="surface"
              >
                <WearFilledTonalButton @click="navigate(route, label)"
                  >{{ label
                  }}<template #detail>{{
                    detail
                  }}</template></WearFilledTonalButton
                >
              </WearListItem>
            </WearList>
          </WearScreenScaffold>
        </template>

        <template #buttons>
          <WearScreenScaffold>
            <WearList label="Button examples">
              <WearListItem
                ><WearListHeader :level="1"
                  >Buttons</WearListHeader
                ></WearListItem
              >
              <WearListItem effect="surface"
                ><WearButton @click="buttonCount++"
                  >Start workout<template #detail
                    >{{ buttonCount }} activities started</template
                  ></WearButton
                ></WearListItem
              >
              <WearListItem effect="surface"
                ><WearFilledTonalButton
                  >Continue</WearFilledTonalButton
                ></WearListItem
              >
              <WearListItem effect="surface"
                ><WearOutlinedButton
                  >View details</WearOutlinedButton
                ></WearListItem
              >
              <WearListItem effect="surface"
                ><WearChildButton>Learn more</WearChildButton></WearListItem
              >
              <WearListItem effect="surface"
                ><WearCompactButton
                  >Compact action</WearCompactButton
                ></WearListItem
              >
              <WearListItem
                ><WearButton disabled>Unavailable</WearButton></WearListItem
              >
              <WearListItem
                ><WearListSubHeader
                  >Icon variants</WearListSubHeader
                ></WearListItem
              >
              <WearListItem
                ><WearButtonGroup label="Icon buttons"
                  ><WearIconButton aria-label="Add">+</WearIconButton
                  ><WearFilledIconButton aria-label="Play"
                    >▶</WearFilledIconButton
                  ><WearFilledTonalIconButton aria-label="Pause"
                    >Ⅱ</WearFilledTonalIconButton
                  ></WearButtonGroup
                ></WearListItem
              >
              <WearListItem
                ><WearButtonGroup label="Round buttons"
                  ><WearOutlinedIconButton aria-label="Stop"
                    >■</WearOutlinedIconButton
                  ><WearTextButton>Go</WearTextButton></WearButtonGroup
                ></WearListItem
              >
              <WearListItem
                ><WearButtonGroup label="Toggle buttons"
                  ><WearIconToggleButton v-model="toggle" aria-label="Favorite"
                    >♥</WearIconToggleButton
                  ><WearTextToggleButton v-model="toggle"
                    >A</WearTextToggleButton
                  ></WearButtonGroup
                ></WearListItem
              >
            </WearList>
            <template #edge
              ><WearEdgeButton @click="buttonCount++"
                >Done</WearEdgeButton
              ></template
            >
          </WearScreenScaffold>
        </template>

        <template #selection>
          <WearScreenScaffold
            ><WearList
              label="Settings"
              :data-settings="JSON.stringify(settings)"
            >
              <WearListItem
                ><WearListHeader :level="1"
                  >Settings</WearListHeader
                ></WearListItem
              >
              <WearListItem effect="none"
                ><WearSwitchButton v-model="enabled"
                  >Notifications<template #detail
                    >Alerts on your watch</template
                  ></WearSwitchButton
                ></WearListItem
              >
              <WearListItem effect="none"
                ><WearSplitSwitchButton
                  v-model="splitEnabled"
                  control-label="Enable connectivity"
                  @action="details++"
                  >Connectivity<template #detail
                    >{{ details }} details opened</template
                  ></WearSplitSwitchButton
                ></WearListItem
              >
              <WearListItem effect="none"
                ><WearCheckboxButton v-model="checked"
                  >Sync over Wi-Fi</WearCheckboxButton
                ></WearListItem
              >
              <WearListItem effect="none"
                ><WearCheckboxButton :model-value="false" disabled
                  >Disabled check</WearCheckboxButton
                ></WearListItem
              >
              <WearListItem effect="none"
                ><WearCheckboxButton :model-value="false" indeterminate
                  >Mixed selection</WearCheckboxButton
                ></WearListItem
              >
              <WearListItem effect="none"
                ><WearSplitCheckboxButton
                  v-model="splitChecked"
                  control-label="Select backup"
                  @action="details++"
                  >Backup details</WearSplitCheckboxButton
                ></WearListItem
              >
              <WearListItem
                ><WearListSubHeader>Power mode</WearListSubHeader></WearListItem
              >
              <WearListItem effect="none"
                ><WearRadioGroup v-model="selected" label="Power mode">
                  <WearRadioButton value="balanced">Balanced</WearRadioButton
                  ><WearRadioButton value="performance"
                    >Performance</WearRadioButton
                  >
                  <WearSplitRadioButton
                    value="custom"
                    control-label="Select custom mode"
                    @action="details++"
                    >Custom mode</WearSplitRadioButton
                  >
                </WearRadioGroup></WearListItem
              >
            </WearList></WearScreenScaffold
          >
        </template>

        <template #cards>
          <WearScreenScaffold
            ><WearList label="Card examples">
              <WearListItem
                ><WearListHeader :level="1">Cards</WearListHeader></WearListItem
              >
              <WearListItem effect="surface"
                ><WearAppCard
                  ><template #icon><span>☀</span></template
                  ><template #name>Weather</template
                  ><template #time>Now</template
                  ><template #title>Clear skies</template>18° · Sunset at
                  5:42</WearAppCard
                ></WearListItem
              >
              <WearListItem effect="surface"
                ><WearTitleCard actionable @click="buttonCount++"
                  ><template #title>Daily activity</template
                  ><template #subtitle>Almost there</template>6,400
                  steps</WearTitleCard
                ></WearListItem
              >
              <WearListItem effect="surface"
                ><WearOutlinedCard
                  ><template #title>Recovery</template>Take a short
                  walk.</WearOutlinedCard
                ></WearListItem
              >
              <WearListItem effect="surface"
                ><WearCard variant="filled"
                  ><template #title>Goal reached</template>Well done
                  today.</WearCard
                ></WearListItem
              >
            </WearList></WearScreenScaffold
          >
        </template>

        <template #slider>
          <WearScreenScaffold
            ><WearList label="Adjust values">
              <WearListItem
                ><WearListHeader :level="1"
                  >Adjust</WearListHeader
                ></WearListItem
              >
              <WearListItem effect="none"
                ><WearSlider
                  v-model="slider"
                  label="Volume"
                  :step="10"
                  segmented
              /></WearListItem>
              <WearListItem
                ><WearText>Volume {{ slider }}%</WearText></WearListItem
              >
              <WearListItem effect="none"
                ><WearSlider
                  :model-value="50"
                  disabled
                  label="Unavailable slider"
              /></WearListItem>
              <WearListItem effect="none"
                ><WearStepper
                  v-model="stepper"
                  label="Repetitions"
                  :min="1"
                  :max="5"
                  ><template #default="{ value }"
                    ><WearText variant="display">{{ value }}</WearText
                    ><WearText as="div" variant="detail"
                      >repetitions</WearText
                    ></template
                  ></WearStepper
                ></WearListItem
              >
            </WearList></WearScreenScaffold
          >
        </template>

        <template #progress>
          <WearScreenScaffold
            ><WearList label="Progress examples">
              <WearListItem
                ><WearListHeader :level="1"
                  >Progress</WearListHeader
                ></WearListItem
              >
              <WearListItem
                ><div class="gallery-rings">
                  <WearCircularProgressIndicator
                    :value="65"
                    label="Activity"
                  /><WearSegmentedCircularProgressIndicator
                    :value="60"
                    label="Daily goals"
                    :segments="5"
                  /></div
              ></WearListItem>
              <WearListItem
                ><WearLinearProgressIndicator :value="65" label="Download"
              /></WearListItem>
              <WearListItem
                ><WearListSubHeader>Loading</WearListSubHeader></WearListItem
              >
              <WearListItem
                ><div class="gallery-rings">
                  <WearCircularProgressIndicator
                    label="Loading activity"
                  /><WearArcProgressIndicator label="Connecting" /></div
              ></WearListItem>
              <WearListItem
                ><WearLinearProgressIndicator label="Syncing"
              /></WearListItem>
              <WearListItem
                ><WearPlaceholder :loading="loading" label="Loading card"
                  ><WearCard>Loaded</WearCard></WearPlaceholder
                ></WearListItem
              >
              <WearListItem
                ><WearButton @click="loading = !loading"
                  >Toggle loading</WearButton
                ></WearListItem
              > </WearList
            ><WearLevelIndicator :value="65" label="Battery level"
          /></WearScreenScaffold>
        </template>

        <template #pickers>
          <WearScreenScaffold
            ><WearList label="Picker examples">
              <WearListItem
                ><WearListHeader :level="1"
                  >Pickers</WearListHeader
                ></WearListItem
              >
              <WearListItem effect="none"
                ><WearPickerGroup label="Timer"
                  ><WearPicker
                    v-model="picker"
                    label="Amount"
                    :options="[
                      { value: 1, label: '1' },
                      { value: 2, label: '2' },
                      { value: 3, label: '3' },
                      { value: 4, label: '4', disabled: true },
                      { value: 5, label: '5' },
                    ]" /><WearPicker
                    v-model="secondPicker"
                    label="Unit"
                    :options="[
                      { value: 'min', label: 'min' },
                      { value: 'hour', label: 'hour' },
                    ]" /></WearPickerGroup
              ></WearListItem>
              <WearListItem
                ><WearButton @click="dialog = 'date'"
                  >Date<template #detail>{{ date }}</template></WearButton
                ></WearListItem
              >
              <WearListItem
                ><WearButton @click="dialog = 'time'"
                  >Time<template #detail>{{ time }}</template></WearButton
                ></WearListItem
              >
              <WearListItem
                ><WearButton @click="dialog = 'duration'"
                  >Duration<template #detail
                    >{{ duration }} seconds</template
                  ></WearButton
                ></WearListItem
              >
            </WearList></WearScreenScaffold
          >
        </template>

        <template #dialogs>
          <WearScreenScaffold
            ><WearList label="Dialog examples">
              <WearListItem
                ><WearListHeader :level="1"
                  >Dialogs</WearListHeader
                ></WearListItem
              >
              <WearListItem
                ><WearButton @click="dialog = 'alert'"
                  >Confirm changes<template #detail
                    >{{ confirmed }} confirmed</template
                  ></WearButton
                ></WearListItem
              >
              <WearListItem
                ><WearFilledTonalButton @click="dialog = 'success'"
                  >Success</WearFilledTonalButton
                ></WearListItem
              >
              <WearListItem
                ><WearFilledTonalButton @click="dialog = 'failure'"
                  >Failure</WearFilledTonalButton
                ></WearListItem
              >
              <WearListItem
                ><WearFilledTonalButton @click="dialog = 'phone'"
                  >Open on phone</WearFilledTonalButton
                ></WearListItem
              >
              <WearListItem
                ><WearFilledTonalButton @click="dialog = 'confirmation'"
                  >Confirmation</WearFilledTonalButton
                ></WearListItem
              >
            </WearList></WearScreenScaffold
          >
        </template>

        <template #horizontal>
          <WearHorizontalPagerScaffold
            v-model="horizontal"
            :pages="pages"
            label="Horizontal catalog"
          >
            <template
              v-for="entry in pages"
              :key="entry.id"
              #[entry.id]="{ active }"
              ><WearAnimatedPage :active="active"
                ><div class="gallery-center">
                  <WearText variant="display">{{ entry.label }}</WearText
                  ><WearText variant="detail">Swipe left or right</WearText>
                </div></WearAnimatedPage
              ></template
            >
          </WearHorizontalPagerScaffold>
        </template>
        <template #vertical>
          <WearVerticalPagerScaffold
            v-model="vertical"
            :pages="pages"
            label="Vertical catalog"
          >
            <template
              v-for="entry in pages"
              :key="entry.id"
              #[entry.id]="{ active }"
              ><WearAnimatedPage :active="active"
                ><div class="gallery-center">
                  <WearText variant="display">{{ entry.label }}</WearText
                  ><WearText variant="detail">Swipe up or down</WearText>
                </div></WearAnimatedPage
              ></template
            >
          </WearVerticalPagerScaffold>
        </template>

        <template #lazy>
          <WearScreenScaffold
            ><WearTransformingLazyColumn
              ref="lazy"
              :items="rows"
              :item-key="(row) => row.id"
              label="Records"
            >
              <template #header
                ><WearListHeader :level="1">Records</WearListHeader
                ><WearCompactButton @click="lazy?.scrollToIndex(150)"
                  >Jump to record 151</WearCompactButton
                ></template
              >
              <template #default="{ item }"
                ><WearTitleCard
                  ><template #title>{{ item.name }}</template
                  >{{ item.detail }}</WearTitleCard
                ></template
              >
            </WearTransformingLazyColumn></WearScreenScaffold
          >
        </template>

        <template #gestures>
          <WearScreenScaffold
            ><WearPullToRefresh v-model="refresh" @refresh="finishRefresh"
              ><WearList label="Gesture examples">
                <WearListItem
                  ><WearListHeader :level="1"
                    >Gestures</WearListHeader
                  ></WearListItem
                >
                <WearListItem effect="none"
                  ><WearSwipeToReveal
                    v-model="revealed"
                    primary-label="Delete"
                    secondary-label="Archive"
                    :undone="removed"
                    @primary="removed = true"
                    @secondary="details++"
                    @undo="removed = false"
                  >
                    <WearTitleCard
                      ><template #title>Morning walk</template>Swipe to see
                      actions</WearTitleCard
                    >
                  </WearSwipeToReveal></WearListItem
                >
                <WearListItem effect="none"
                  ><WearExpandableItem
                    v-model="expanded"
                    label="Show activity details"
                    ><WearText
                      >42 minutes · 3.2 km</WearText
                    ></WearExpandableItem
                  ></WearListItem
                >
                <WearListItem
                  ><WearButton
                    :disabled="refresh"
                    @click="
                      refresh = true;
                      finishRefresh();
                    "
                    >Refresh data<template #detail
                      >{{ refreshes }} updates</template
                    ></WearButton
                  ></WearListItem
                >
                <WearListItem
                  ><WearOneHandedGesture
                    label="Host gesture available"
                    hint
                    @gesture="hints++"
                    ><div ref="gesture">
                      <WearButton
                        aria-label="Simulate gesture"
                        @click="stimulate"
                        ><WearOneHandedGestureClickIndicator
                          :key="hints"
                          :hint="hints > 0"
                          >Simulate gesture</WearOneHandedGestureClickIndicator
                        ><template #detail
                          >{{ hints }} received</template
                        ></WearButton
                      >
                    </div></WearOneHandedGesture
                  ></WearListItem
                >
              </WearList></WearPullToRefresh
            ></WearScreenScaffold
          >
        </template>

        <template #type>
          <WearAmbientMode :active="ambient"
            ><WearScreenScaffold
              ><WearList label="Text examples">
                <WearListItem
                  ><WearListHeader :level="1"
                    >Typography</WearListHeader
                  ></WearListItem
                >
                <WearListItem
                  ><WearAnimatedText :value="count" variant="display"
                /></WearListItem>
                <WearListItem
                  ><WearButton @click="count++"
                    >Animate number</WearButton
                  ></WearListItem
                >
                <WearListItem
                  ><WearText variant="title">Title</WearText
                  ><WearText as="p"
                    >Body content follows the font scale.</WearText
                  ><WearText variant="detail"
                    >Supporting information</WearText
                  ></WearListItem
                >
                <WearListItem
                  ><WearFadingExpandingLabel
                    text="A long label with additional information"
                    :expanded="expanded"
                /></WearListItem>
                <WearListItem
                  ><WearButton @click="expanded = !expanded"
                    >Expand label</WearButton
                  ></WearListItem
                >
                <WearListItem
                  ><WearButton @click="previewAmbient"
                    >Preview ambient</WearButton
                  ></WearListItem
                > </WearList
              ><WearCurvedLayout position="bottom"
                ><WearCurvedText text="Wear Material 3" /><WearCurvedRow
                  :angle="55"
                  :spacing="20"
                  ><WearIcon label="Heart">♥</WearIcon
                  ><WearIcon label="Star">★</WearIcon></WearCurvedRow
                ></WearCurvedLayout
              ></WearScreenScaffold
            ></WearAmbientMode
          >
        </template>
      </WearNavigation>

      <WearAlertDialog
        :model-value="dialog === 'alert'"
        title="Save changes?"
        confirm-label="Save changes"
        @update:model-value="!$event && (dialog = '')"
        @confirm="confirmed++"
        >Your updated settings will apply to this watch.</WearAlertDialog
      >
      <WearSuccessConfirmationDialog
        :model-value="dialog === 'success'"
        title="Saved"
        @update:model-value="!$event && (dialog = '')"
      />
      <WearFailureConfirmationDialog
        :model-value="dialog === 'failure'"
        title="Try again"
        @update:model-value="!$event && (dialog = '')"
        >Check your connection.</WearFailureConfirmationDialog
      >
      <WearOpenOnPhoneDialog
        :model-value="dialog === 'phone'"
        title="Continue on phone"
        :duration="0"
        @update:model-value="!$event && (dialog = '')"
      />
      <WearConfirmationDialog
        :model-value="dialog === 'confirmation'"
        title="Completed"
        @update:model-value="!$event && (dialog = '')"
      />
      <WearDialog
        :model-value="['date', 'time', 'duration'].includes(dialog)"
        :label="`${dialog} picker`"
        @update:model-value="!$event && (dialog = '')"
      >
        <template #content="{ titleId }"
          ><WearPickerScreen
            :title="
              dialog === 'date'
                ? 'Choose a date'
                : dialog === 'time'
                  ? 'Choose a time'
                  : 'Set duration'
            "
            :title-id="titleId"
            @confirm="dialog = ''"
          >
            <WearDatePicker
              v-if="dialog === 'date'"
              v-model="date"
              locale="en-GB"
              :min-year="2020"
              :max-year="2030"
            />
            <WearTimePicker v-if="dialog === 'time'" v-model="time" seconds />
            <WearDurationPicker
              v-if="dialog === 'duration'"
              v-model="duration"
            /> </WearPickerScreen
        ></template>
      </WearDialog>
    </WearScaffold>
  </WearMaterialTheme>
</template>

<style>
.gallery-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(8 * var(--wear-unit));
  height: 100%;
  padding: 20% 16%;
  text-align: center;
}
.gallery-rings {
  display: flex;
  gap: calc(16 * var(--wear-unit));
  justify-content: center;
  padding-block: calc(12 * var(--wear-unit));
}
</style>
