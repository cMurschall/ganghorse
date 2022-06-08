<template>
  <div>
    <q-card flat bordered>
      <q-card-section>
        <q-list>
          <!-- :class="[fileStatus(imgData, index) == 0 ?  '' : 'bg-red-11']" -->
          <div>
            {{
              $t("createHorse.nImagesLeft", {
                noFiles: maxFiles - imageData.length,
                maxSize: formatFileSize(maxFileSizeInBytes),
              })
            }}
          </div>
          <q-item
            v-for="(imgData, index) in imageData"
            :key="'image' + index"
            clickable
            v-ripple
          >
            <!-- {{ imageData}} -->
            <q-item-section avatar>
              <q-avatar rounded>
                <img :src="imgData.thumbUrl" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{
                imgData.originalFileName
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn-group>
                <q-btn
                  :disable="disable"
                  outline
                  round
                  color="gangHorseBlue"
                  icon="keyboard_arrow_up"
                  size="sm"
                  @click="moveImageUp($event, index)"
                />
                <q-btn
                  :disable="index === imageData.length - 1"
                  outline
                  round
                  color="gangHorseBlue"
                  icon="keyboard_arrow_down"
                  size="sm"
                  @click="moveImageDown($event, index)"
                />
                <q-btn
                  outline
                  round
                  color="gangHorseBlue"
                  icon="clear"
                  size="sm"
                  :disable="disable"
                  @click="onRemoveImage($event, imgData)"
                />
              </q-btn-group>
            </q-item-section>
          </q-item>
        </q-list>

        <q-banner class="text-white bg-red" v-if="showError">
          {{ errorMessage }}
          <template v-slot:action>
            <q-btn flat color="white" label="OK" @click="showError = false" />
          </template>
        </q-banner>
      </q-card-section>

      <q-separator />

      <q-card-actions>
        <q-btn
          color="gangHorseBlue"
          icon="add_to_photos"
          :label="$t('createHorse.addImage')"
          @click="onPickFile"
          :disable="imageData.length > maxFiles || disable"
        />
        <input
          type="file"
          style="display: none"
          accept="image/*"
          ref="imageFileInput"
          @change="onFilePicked"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { format } from "quasar";
const { humanStorageSize } = format;

import {
  imageAddNew,
  imageUpdateIndices,
  imageRemove,
} from "./../helpers/apiService";

export default {
  name: "ImageHandler",
  props: ["feifId", "horseId", "imageUrls", "disable"],
  data() {
    return {
      imageData: [],
      maxFiles: 5,
      maxFileSizeInBytes: 12 * 1024 * 1024,
      showError: false,
      errorMessage: "",
    };
  },

  methods: {
    onPickFile() {
      this.$refs.imageFileInput.click();
    },
    async onFilePicked(event) {
      for (let index = 0; index < event.target.files.length; index++) {
        try {
          const file = event.target.files[index];

          var transformedFile = await transformFile(file);

          let formData = new FormData();

          formData.append(
            "horseId",
            JSON.stringify({
              id: this.horseId,
              feifId: this.feifId,
              showIndex: this.imageData.length + 1,
            })
          );
          formData.append("image", transformedFile.raw);
          var uploadResult = await imageAddNew(formData);

          console.debug("uploadResult :", uploadResult);
          if (uploadResult.success) {
            this.imageData.push(uploadResult.result);
          } else {
            console.debug(file);

            this.showError = true;
            this.errorMessage = `Failed to upload image file '${file.name}'`;
          }
        } catch (error) {
          this.showError = true;
          this.errorMessage = error;
        }
      }
    },

    async onRemoveImage(_, imageElement) {
      const result = await imageRemove(imageElement.id);

      if (result) {
        const index = this.imageData.findIndex((x) => x.id == imageElement.id);
        if (index >= 0) {
          this.imageData.splice(index, 1);
        }
      } else {
        this.showError = true;
        this.errorMessage = error;
      }
    },

    async moveImageUp(_, index) {
      if (index > 0) {
        try {
          movePosition(this.imageData, index, index - 1);
          var result = await imageUpdateIndices(this.imageData);
          console.log(result)
        } catch (error) {
          this.showError = true;
          this.errorMessage = error;
        }
      }
    },
    async moveImageDown(_, index) {
      if (index < this.imageData.length - 1) {
        try {
          movePosition(this.imageData, index, index + 1);
          var result = await imageUpdateIndices(this.imageData);
          console.log(result)
        } catch (error) {
          this.showError = true;
          this.errorMessage = error;
        }
      }
    },
    formatFileSize(sizeInBytes) {
      return humanStorageSize(sizeInBytes);
    },
  },
  watch: {
    imageUrls(newValue, oldValue) {
      this.imageData = JSON.parse(JSON.stringify(newValue));
    },
  },
};

const transformFile = (inputFile) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener("load", () => {
      resolve({
        raw: inputFile,
        url: fileReader.result,
      });
    });
    fileReader.readAsDataURL(inputFile);
  });
};

const movePosition = (array, from, to) => {
  array.splice(to, 0, array.splice(from, 1)[0]);
  
  // update showindex
  for (let index = 0; index < array.length; index++) {
     array[index].showIndex = index + 1;    
  }
};
</script>

<style>
</style>