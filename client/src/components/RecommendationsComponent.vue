/* eslint-disable vue/multi-word-component-names */
<template>
  <section>
    <v-combobox
        v-model="selectedUser"
        :items="['Ersteller1', 'Ersteller2', 'Ersteller3', 'Ersteller4', 'Ersteller5']"
        label="Benutzer">
    </v-combobox>
    <div class="expansion-panels-container">
      <div>
        <h2 class="text-h5">Erstellte Artefakte</h2>
        <v-expansion-panels>
          <v-expansion-panel
              v-for="(visualisation, index) in visualisationsByUser"
              :key="index">
            <v-expansion-panel-title>{{ visualisation.name }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-col >
                <v-img :src="visualisation.image" alt="Visualization Image" />
                <v-card-text>{{ visualisation.name }}</v-card-text>
                <v-card-text>VizualisationType: {{ visualisation.visualizationType }}</v-card-text>
                <v-card-text>Configuration: {{ visualisation.configuration }}</v-card-text>
                <v-card-text>Tags: {{ visualisation.tags }}</v-card-text>
                <v-card-text>Description: {{ visualisation.description }}</v-card-text>
              </v-col>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <div>
        <h2 class="text-h5">Artefakte Auswahl</h2>
        <v-expansion-panels>
          <v-expansion-panel
              v-for="(visualisation, index) in otherVisualisations"
              :key="index">
            <v-expansion-panel-title>{{ visualisation.name }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-col >
                <v-img :src="visualisation.image" alt="Visualization Image" />
                <v-card-text>{{ visualisation.name }}</v-card-text>
                <v-card-text>VizualisationType: {{ visualisation.visualizationType }}</v-card-text>
                <v-card-text>Configuration: {{ visualisation.configuration }}</v-card-text>
                <v-card-text>Tags: {{ visualisation.tags }}</v-card-text>
                <v-card-text>Description: {{ visualisation.description }}</v-card-text>
              </v-col>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <div>
        <h2 class="text-h5">Recommendations</h2>
        <v-expansion-panels>
          <v-expansion-panel
              v-for="(visualisation, index) in responseRecommendations"
              :key="index">
            <v-expansion-panel-title>{{ visualisation.name }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-col >
                <v-img :src="visualisation.image" alt="Visualization Image" />
                <v-card-text>{{ visualisation.name }}</v-card-text>
                <v-card-text>VizualisationType: {{ visualisation.visualizationType }}</v-card-text>
                <v-card-text>Configuration: {{ visualisation.configuration }}</v-card-text>
                <v-card-text>Tags: {{ visualisation.tags }}</v-card-text>
                <v-card-text>Description: {{ visualisation.description }}</v-card-text>
              </v-col>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
<!--      <div>-->
<!--        <h2 class="text-h5">Recommendations By Image</h2>-->
<!--        <v-expansion-panels>-->
<!--          <v-expansion-panel-->
<!--              v-for="(visualisation, index) in responseRecommendations"-->
<!--              :key="index">-->
<!--            <v-expansion-panel-title>{{ visualisation.name }}</v-expansion-panel-title>-->
<!--            <v-expansion-panel-text>-->
<!--              <v-col >-->
<!--                <v-img :src="visualisation.image" alt="Visualization Image" />-->
<!--                <v-card-text>{{ visualisation.name }}</v-card-text>-->
<!--                <v-card-text>VizualisationType: {{ visualisation.visualizationType }}</v-card-text>-->
<!--                <v-card-text>Configuration: {{ visualisation.configuration }}</v-card-text>-->
<!--                <v-card-text>Tags: {{ visualisation.tags }}</v-card-text>-->
<!--              </v-col>-->
<!--            </v-expansion-panel-text>-->
<!--          </v-expansion-panel>-->
<!--        </v-expansion-panels>-->
<!--      </div>-->
    </div>
    <div class="buttons-container">
      <v-btn @click="getRecommendations">Get Recommendations</v-btn>
<!--      <v-btn @click="getDescriptionFromImage">Get Recommendations By Image</v-btn>-->
    </div>
  </section>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import {
  getChatResponse,
  createModel,
  getVisualisationsTags,
  saveVisualisationsTags,
  getChatResponseImage, saveDescription, getDescription
} from './api.js';

const neo4j = require('neo4j-driver');
const selectedUser = ref('Ersteller1');

const visualisations = ref([]);
const visualisationsWithText = ref([]);
const responseRecommendations = ref([]);
const responseVisualisations = ref([]);
const visualisationsWithImage = ref([]);
const visualisationsWithDescription = ref([]);

onMounted(async () => {
  try {
    visualisations.value = await getAllVisualisations();
    console.log(visualisations.value);
    visualisationsWithText.value = await getTagsForVisualisations();
    visualisationsWithDescription.value = await getDescriptionFromImage();
    visualisationsWithImage.value = await getImagesForVisualisations(visualisationsWithDescription);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

const visualisationsByUser = computed(() => {
  if (!selectedUser.value) {
    return visualisationsWithDescription.value;
  }
  return visualisationsWithDescription.value.filter(v => v.createdBy === selectedUser.value);
});

const otherVisualisations = computed(() => {
  if (!selectedUser.value) {
    return [];
  }
  return visualisationsWithDescription.value.filter(v => v.createdBy !== selectedUser.value);
});

async function getAllVisualisations() {
  const driver = neo4j.driver('neo4j://localhost:7150', neo4j.auth.basic('neo4j', 'kosmos-database'));
  const session = driver.session();
  const visualisations = [];
  try {
    const result = await session.run('MATCH (n:Visualization) WHERE id(n) IN [71, 39, 57, 170, 13, 15, 75, 172, 36, 44, 154, 180, 183, 197, 221, 235, 336, 344, 369, 371, 395, 404, 415, 473, 474, 485, 499, 622, 614, 589] RETURN n ');
    result.records.forEach(record => {
      const node = record.get('n');
      // eslint-disable-next-line no-unused-vars
      const {previewImgUri, timeCreated, dataProcess, ...rest} = node.properties;
      visualisations.push({id: node.identity.low, ...rest, image: previewImgUri});
    });
  } finally {
    await session.close();
    await driver.close();
  }
  return visualisations;
}

async function getImagesForVisualisations(visualisationsWithDescription) {
  const driver = neo4j.driver('neo4j://localhost:7150', neo4j.auth.basic('neo4j', 'kosmos-database'));
  const session = driver.session();
  const visualisationsWithImage = [];
  try {
    const result = await session.run('MATCH (n:Visualization) WHERE id(n) IN [71, 39, 57, 170, 13, 15, 75, 172, 36, 44, 154, 180, 183, 197, 221, 235, 336, 344, 369, 371, 395, 404, 415, 473, 474, 485, 499, 622, 614, 589] RETURN n ');
    result.records.forEach(record => {
      const node = record.get('n');
      const previewImgUri = node.properties.previewImgUri;
      const base64Data = previewImgUri
      for (let v of visualisationsWithDescription.value) {
        if (v.id === node.identity.low) {
          v.image = base64Data;
          visualisationsWithImage.push(v);
        }
      }
    });
  } finally {
    await session.close();
    await driver.close();
}
  return visualisationsWithImage;
}

const getRecommendations = async () => {
  const modelName = 'RecGPT';
  await createModel(modelName, 'FROM llama3\nPARAMETER temperature 0.1\nSYSTEM You are a giving Recommendations for a Solution Architect. Please only return recommendations in a json format.');
  const visualisationsByUserWithoutImage = visualisationsByUser.value.map(v => {
    // eslint-disable-next-line no-unused-vars
    const { image, ...rest } = v;
    return rest;
  });
  const otherVisualisationsWithoutImage = otherVisualisations.value.map(v => {
    // eslint-disable-next-line no-unused-vars
    const { image, ...rest } = v;
    return rest;
  });
  const finalRecommendations = [];
  const promptRec = `I have created these visualisations: ${JSON.stringify(visualisationsByUserWithoutImage)} \n
    Can you respond with three visualisations that are similiar to the ones i created, out of these:\n ${JSON.stringify(otherVisualisationsWithoutImage)}`
      + '\n Respond with the IDs. Respond using JSON';
  const response = await getChatResponse(promptRec, modelName);
  console.log(response);
  const parsedResponse = JSON.parse(response);
  for (let v of visualisationsWithImage.value) {
    for (let rec of parsedResponse.recommendations) {
      if (v.id === rec) {
        finalRecommendations.push(v);
      }
      if (v.id === rec.id) {
        finalRecommendations.push(v);
      }
    }
  }
  responseRecommendations.value = finalRecommendations;
};

const getTagsForVisualisations = async () => {
  const modelNameTag = 'TagGPT';
  await createModel(modelNameTag, 'FROM llama3\nPARAMETER temperature 0.2\nSYSTEM You are a Software expert. Please only return in a json format.');

  responseVisualisations.value = await getVisualisationsTags();
  let visualisationsWithTagsResponse = [];
  for (let visualisation of visualisations.value) {
    let isTagged = false;
    for (let responseVisualisation of responseVisualisations.value) {
      if (visualisation.id === responseVisualisation.id) {
        isTagged = true;
        visualisationsWithTagsResponse.push(responseVisualisation);
        break;
      }
    }
    if (!isTagged) {
      const promptRecTag = `Can you please attach tags to this entry:\n ${JSON.stringify(visualisation)}\n Please return the full array with the tags added as additional property. Attach the tags with this structure: "tags": [
        {"tag": "", "weight": },
    ] Respond using JSON`;
      const chatResponse = await getChatResponse(promptRecTag, modelNameTag);
      const parsedChatResponse = JSON.parse(chatResponse);
      console.log(parsedChatResponse);
      const saveVisualisations = responseVisualisations.value;
      saveVisualisations.push(parsedChatResponse);
      await saveVisualisationsTags(saveVisualisations);
      visualisationsWithTagsResponse.push(parsedChatResponse);
    }
  }

  return visualisationsWithTagsResponse;
}

const getDescriptionFromImage = async () => {
  const modelNameImage = 'ImageRankGPT';
  await createModel(modelNameImage, 'FROM llava\nSYSTEM You are a Software Expert. PARAMETER temperature 0.2\n');
  responseVisualisations.value = await getDescription();
  let visualisationsWithDescription = [];
  for (let v of visualisationsWithText.value) {
    let isDescribed = false;
    for (let visualisation of responseVisualisations.value) {
      if (v.id === visualisation.id) {
        isDescribed = true;
        visualisationsWithDescription.push(visualisation);
        break;
      }
    }
    if (!isDescribed) {
      let imageB64 = v.image.split(',')[1];
      const promptRec = 'Can you give a detailed description for this image.';
      const response = await getChatResponseImage(promptRec, modelNameImage, imageB64);
      console.log(response);
      v.description = response;
      v.image = "";
      const saveVisualisations = responseVisualisations.value;
      saveVisualisations.push(v);
      await saveDescription(saveVisualisations);
    }
  }
  return visualisationsWithDescription;
};


</script>

<style scoped>
.expansion-panels-container {
  display: flex;
  gap: 20px;
}

.expansion-panels-container > div {
  flex: 1;
}

.buttons-container {
  display: flex;
  justify-content: center;
  flex-direction: row;
  margin-top: 20px;
}

.text-h5 {
  margin-bottom: 20px;
  text-align: center;
}
</style>