<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg" style="width: 90%;">
      <q-card-section>
        <div class="text-h6 text-weight-bold">{{  t("Add Contexts & Tags", "Add Contexts & Tags")}}</div>
      </q-card-section>

      <!-- Row: Contexts on left, Tags on right -->
      <q-card-section>
        <div class="row q-col-gutter-lg">
          <!-- Contexts -->
          <div class="col-12 col-md-6">
            <div class="row items-center q-mb-md">
              <div class="text-subtitle1 text-primary q-mr-lg">{{  t("Contexts", "Contexts")}}</div>
              <q-btn :label="t('Add Context', 'Add Context')"  :color="$q.dark.isActive ? 'grey-8' : 'black'" rounded
                @click="contextDialog = true" />
            </div>
            <div class="context-grid">
              <div v-for="context in contexts" :key="context.context_id" class="context-item row items-center q-mb-md">
                <q-avatar :style="{ backgroundColor: getColor(context.name) }" size="40px" class="q-mr-md">
                  <q-icon :name="context.icon" color="white" />
                </q-avatar>
                <div class="text-body1">{{ context.name }}</div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="col-12 col-md-6">
            <div class="row items-center q-mb-md">
              <div class="text-subtitle1 text-primary q-mr-lg">{{  t("Tags", "Tags")}}</div>
              <q-btn :label="t('Add Tag', 'Add Tag')"  :color="$q.dark.isActive ? 'grey-8' : 'black'" rounded @click="tagDialog = true" />
            </div>
            <div class="tag-grid">
              <q-chip v-for="tag in tags" :key="tag.tag_id" :color="$q.dark.isActive ? 'grey-9' : 'grey-3'"
                :text-color="$q.dark.isActive ? 'white' : 'black'" class="q-mb-sm q-mr-sm">
                {{ tag.name }}
              </q-chip>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Add Context Dialog -->
      <q-dialog v-model="contextDialog" persistent>
        <q-card class="q-pa-lg shadow-2 rounded-2xl" style="min-width: 400px; max-width: 500px;">
          <div class="text-h6 q-mb-md">Add New Context</div>

          <q-form @submit.prevent="addContext" class="q-gutter-md q-ma-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input v-model="newContext.name" filled dense clearable label="Context Name" required />
              </div>
              <div class="col-12">
                <q-input v-model="newContext.icon" filled dense clearable label="Icon Name (optional)" />
              </div>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancel" color="secondary" v-close-popup />
              <q-btn label="Add" color="primary" type="submit" />
            </div>
          </q-form>
        </q-card>
      </q-dialog>

      <!-- Add Tag Dialog -->
      <q-dialog v-model="tagDialog" persistent>
        <q-card class="q-pa-lg shadow-2 rounded-2xl" style="min-width: 400px; max-width: 500px;">
          <div class="text-h6 q-mb-md">Add New Tag</div>

          <q-form @submit.prevent="addTag" class="q-gutter-md q-ma-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input v-model="newTag.name" filled dense clearable label="Tag Name" required />
              </div>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancel" color="secondary" v-close-popup />
              <q-btn label="Add" color="primary" type="submit" />
            </div>
          </q-form>
        </q-card>
      </q-dialog>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";

const $q = useQuasar();

const contexts = ref([]);
const tags = ref([]);

const contextDialog = ref(false);
const tagDialog = ref(false);

const newContext = ref({ name: "", icon: "" });
const newTag = ref({ name: "" });

const contextPalette = ["#1e3a8a", "#0a2a3d", "#1d4ed8", "#2563eb"];

function getColor(name) {
  const index =
    Math.abs([...name].reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
    contextPalette.length;
  return contextPalette[index];
}

const translations = ref({});

const fetchSystemTranslation = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/system/contexts_tags`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    console.log("response.data", response.data);
    translations.value = response.data.reduce((acc, t) => {
      acc[t.entity_name] = t.translation;
      return acc;
    }, {});
  } catch (err) {
    console.error("Failed to fetch translations:", err.response?.data || err.message);
  }
};

const t = (key, fallback) => {
  return translations.value[key] || fallback || key;
};

const fetchContexts = async () => {
  try {
    const res = await axios.get("http://localhost:3000/contexts", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    contexts.value = res.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

const fetchTags = async () => {
  try {
    const res = await axios.get("http://localhost:3000/tags", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    tags.value = res.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

const addContext = async () => {
  try {
    await axios.post(
      "http://localhost:3000/contexts",
      newContext.value,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    contextDialog.value = false;
    newContext.value = { name: "", icon: "" };
    fetchContexts();
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

const addTag = async () => {
  try {
    await axios.post(
      "http://localhost:3000/tags",
      newTag.value,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    tagDialog.value = false;
    newTag.value = { name: "" };
    fetchTags();
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

onMounted(() => {
  fetchSystemTranslation();
  fetchContexts();
  fetchTags();
});
</script>

<style scoped>
.context-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  max-height: 400px;
  overflow-y: auto;
}
</style>
