/**
 * Quest System
 * Simple quest tracking and UI updates
 */

import { CFG } from './config.js';

export class QuestSystem {
    constructor() {
        this.currentProgress = 0;
        this.maxProgress = CFG.QUEST_ENEMY_GOAL;
        this.displayElement = null;
    }

    /**
     * Initialize quest system
     */
    init() {
        this.displayElement = document.getElementById('quest-disp');
        this.setDescription(`Purge the Ruins (0/${this.maxProgress})`);
    }

    /**
     * Set quest description
     * @param {string} text - Quest description
     */
    setDescription(text) {
        if (this.displayElement) {
            this.displayElement.innerHTML = `<span class="q-active">${text}</span>`;
        }
    }

    /**
     * Increment quest progress
     */
    progress() {
        this.currentProgress++;

        if (this.currentProgress < this.maxProgress) {
            this.setDescription(`Purge the Ruins (${this.currentProgress}/${this.maxProgress})`);
        } else {
            this.complete();
        }
    }

    /**
     * Complete the quest
     */
    complete() {
        if (this.displayElement) {
            this.displayElement.innerHTML =
                '<span class="q-active" style="color:#57cc99">Ruins Cleared!</span>';
        }
    }

    /**
     * Reset quest
     */
    reset() {
        this.currentProgress = 0;
        this.init();
    }
}
