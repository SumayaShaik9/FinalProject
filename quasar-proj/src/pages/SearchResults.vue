<template>
  <q-dialog v-model="userStore.showSearchResults">
    <q-card class="q-pa-lg shadow-2 rounded-2xl" style="min-width: 80%; max-width: 1600px; height: 85vh;">
      <div class="text-h6 q-mb-md">Find People</div>

      <div class="row q-col-gutter-lg full-width justify-center">
        <!-- Show identities if any -->
        <template v-if="userStore.filteredIdenitities.length">
          <div
            v-for="identity in userStore.filteredIdenitities"
            :key="identity.identity_id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card class="q-pa-md" style="border-radius: 15px; min-height: 300px;">
              <!-- Avatar + Name + Context -->
              <div class="row items-center q-mb-sm">
                <q-avatar size="50px">
                  <img :src="identity.profile_photo || defaultAvatar" />
                </q-avatar>
                <div class="q-ml-md">
                  <div class="text-subtitle1">{{ identity.display_name }}</div>
                  <div class="text-caption text-grey">{{ identity.context || 'No context' }}</div>
                </div>
              </div>

              <!-- Additional info -->
              <div class="text-body2 q-mb-xs" v-if="identity.nickname">
                <q-icon name="badge" size="16px" class="q-mr-xs" />
                {{ identity.nickname }}
              </div>
              <div class="text-body2 q-mb-xs" v-if="identity.gender_identity">
                <q-icon name="wc" size="16px" class="q-mr-xs" />
                {{ identity.gender_identity }}
              </div>
              <div class="text-body2 q-mb-xs" v-if="identity.language">
                <q-icon name="translate" size="16px" class="q-mr-xs" />
                {{ identity.language }}
              </div>
              <div class="text-body2 q-mb-xs" v-if="identity.location">
                <q-icon name="location_on" size="16px" class="q-mr-xs" />
                {{ identity.location }}
              </div>
              <div class="text-body2 q-mb-xs" v-if="identity.organization">
                <q-icon name="business" size="16px" class="q-mr-xs" />
                {{ identity.organization }}
              </div>
              <div class="text-body2 q-mb-xs" v-if="identity.website">
                <q-icon name="link" size="16px" class="q-mr-xs" />
                <a :href="identity.website" target="_blank" class="text-primary">{{ identity.website }}</a>
              </div>

              <!-- Tags -->
              <div class="q-mt-sm" v-if="identity.tags">
                <q-chip
                  v-for="tag in getUniqueTags(identity.tags)"
                  :key="tag"
                  dense
                  outlined
                  class="q-mb-xs q-mr-xs"
                >
                  {{ tag }}
                </q-chip>
              </div>
            </q-card>
          </div>
        </template>

        <!-- No identities message -->
        <template v-else>
          <div class="col-12 flex flex-center q-pa-xl">
            <div class="text-center text-subtitle2 text-grey">
              No identities match this search.
            </div>
          </div>
        </template>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useUserStore } from "../stores/userStore.js";
import defaultAvatar from "../../src/assets/default-avatar.png";

const userStore = useUserStore();

// Return up to 5 unique tags, removing duplicates
const getUniqueTags = (tagsString) => {
  if (!tagsString) return [];
  const unique = [...new Set(tagsString.split(','))];
  return unique.slice(0, 5);
};
</script>
