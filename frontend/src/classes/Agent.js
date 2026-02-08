import Phaser from 'phaser';

const AGENT_STATES = {
    IDLE: { id: 'idle', text: 'Đang nghỉ ngơi', color: '#95a5a6', icon: '😊', animation: 'idle' },
    WORKING: { id: 'working', text: 'Đang làm việc', color: '#3498db', icon: '💼', animation: 'working' },
    CODING: { id: 'coding', text: 'Đang code', color: '#2ecc71', icon: '⌨️', animation: 'typing' },
    THINKING: { id: 'thinking', text: 'Đang suy nghĩ', color: '#9b59b6', icon: '🤔', animation: 'thinking' },
    DISCUSSING: { id: 'discussing', text: 'Đang trao đổi', color: '#f39c12', icon: '💬', animation: 'talking' },
    REVIEWING: { id: 'reviewing', text: 'Đang review', color: '#1abc9c', icon: '📝', animation: 'reading' },
    BREAK: { id: 'break', text: 'Nghỉ giải lao', color: '#34495e', icon: '☕', animation: 'drinking' },
    WALKING: { id: 'walking', text: 'Đang di chuyển', color: '#16a085', icon: '🚶', animation: 'walking' }
};

export { AGENT_STATES };

export class Agent {
    constructor(scene, data) {
        this.scene = scene;
        this.id = data.id;
        this.agentId = data.agentId || null;
        this.name = data.name;
        this.role = data.role;
        this.gender = data.gender;
        this.state = AGENT_STATES.IDLE;
        this.homePosition = { ...data.position };
        this.currentTask = null;

        this.stats = { tasksCompleted: 0, hoursWorked: 0, interactions: 0 };
        this.isBusy = false;
        this.currentInteraction = null;
        this.lastInteraction = null;
        this.hasError = false;

        // Visuals
        this.container = this.scene.add.container(data.position.x, data.position.y - 20);
        this.chibiContainer = null;
        this.components = {};
        this.createVisuals();

        this.container.setDepth(data.position.y + 100);
        this.container.setSize(50, 70).setInteractive({ useHandCursor: true });
        this.container.on('pointerdown', () => this.scene.selectAgent(this));

        this.startIdleAnimation();
    }

    createVisuals() {
        // Shadow
        this.container.add(this.scene.add.ellipse(0, 35, 40, 16, 0x000000, 0.4));

        // Chibi
        this.chibiContainer = this.createChibiGraphics();
        this.container.add(this.chibiContainer);

        // Status Bubble
        const bubble = this.scene.add.container(25, -40);
        const bubbleBg = this.scene.add.graphics().fillStyle(0xffffff, 0.95).fillRoundedRect(-15, -15, 30, 30, 8);
        bubbleBg.lineStyle(2, 0x333333, 0.5).strokeRoundedRect(-15, -15, 30, 30, 8);
        this.components.statusEmoji = this.scene.add.text(0, 0, this.state.icon, { fontSize: '16px' }).setOrigin(0.5);
        this.components.bubbleBg = bubbleBg;
        bubble.add([bubbleBg, this.components.statusEmoji]);
        this.container.add(bubble);

        // Labels
        this.components.nameLabel = this.scene.add.text(0, -60, this.name, {
            fontSize: '12px', fontFamily: 'Rajdhani', fontStyle: 'bold', color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.8)', padding: { x: 10, y: 4 }
        }).setOrigin(0.5);
        this.container.add(this.components.nameLabel);

        this.components.statusText = this.scene.add.text(0, -45, this.state.text, {
            fontSize: '9px', fontFamily: 'Rajdhani', color: this.state.color
        }).setOrigin(0.5);
        this.container.add(this.components.statusText);
    }

    createChibiGraphics() {
        const c = this.scene.add.container(0, 0);
        const skin = this.gender === 'female' ? 0xFFE4C4 : 0xFFDAAB;
        const hair = [0x2C1810, 0x4A3728, 0x8B4513][Phaser.Math.Between(0, 2)];

        c.add(this.scene.add.graphics().fillStyle(this.role.color, 1).fillRoundedRect(-12, 8, 24, 28, 8)); // Body
        c.add(this.scene.add.graphics().fillStyle(this.role.color, 1).fillRoundedRect(-18, 12, 8, 18, 4)); // Arm L
        c.add(this.scene.add.graphics().fillStyle(this.role.color, 1).fillRoundedRect(10, 12, 8, 18, 4)); // Arm R
        c.add(this.scene.add.circle(-14, 30, 4, skin)); // Hand L
        c.add(this.scene.add.circle(14, 30, 4, skin)); // Hand R
        c.add(this.scene.add.graphics().fillStyle(skin, 1).fillCircle(0, -8, 22)); // Head

        const h = this.scene.add.graphics().fillStyle(hair, 1); // Hair
        if (this.gender === 'female') h.fillCircle(0, -14, 24).fillEllipse(0, -5, 52, 20);
        else h.fillCircle(0, -14, 23).fillTriangle(-12, -35, -6, -20, 0, -35).fillTriangle(0, -38, 6, -22, 12, -35);
        c.add(h);

        c.add(this.scene.add.ellipse(-8, -10, 10, 12, 0xFFFFFF)); // Eye L
        c.add(this.scene.add.ellipse(8, -10, 10, 12, 0xFFFFFF)); // Eye R
        const eyeColor = [0x4A90D9, 0x2ECC71, 0x8E44AD][Phaser.Math.Between(0, 2)];
        c.add(this.scene.add.circle(-8, -9, 5, eyeColor));
        c.add(this.scene.add.circle(8, -9, 5, eyeColor));

        c.add(this.scene.add.graphics().fillStyle(0xFFFFFF, 0.9).fillCircle(0, 18, 9)); // Badge
        c.add(this.scene.add.text(0, 17, this.role.icon, { fontSize: '10px' }).setOrigin(0.5));

        return c;
    }

    setState(state) {
        this.state = state;
        this.components.statusEmoji.setText(state.icon);
        this.components.statusText.setText(state.text).setColor(state.color);
        this.stopAnimations();

        if (state.animation === 'talking') {
            this.talkTween = this.scene.tweens.add({ targets: this.chibiContainer, angle: 5, y: -2, duration: 400, yoyo: true, repeat: -1 });
        } else {
            this.startIdleAnimation();
        }

        if (this.scene.selectedAgent === this) this.scene.uiManager.updateAgentPanel(this);
        this.scene.uiManager.updateAgentList(this.scene.agents);
    }

    startIdleAnimation() {
        this.stopAnimations();
        this.breathTween = this.scene.tweens.add({ targets: this.container, scaleY: 1.02, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.idleTween = this.scene.tweens.add({ targets: this.chibiContainer, angle: 2, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    stopAnimations() {
        ['idleTween', 'breathTween', 'workTween', 'talkTween', 'walkTween', 'movementTween'].forEach(t => { if (this[t]) { this[t].stop(); this[t] = null; } });
        if (this.chibiContainer) {
            this.chibiContainer.setPosition(0, 0).setAngle(0);
        }
    }

    moveTo(x, y, cb, onProgress) {
        this.stopAnimations();
        const dist = Math.sqrt(Math.pow(x - this.container.x, 2) + Math.pow(y - this.container.y, 2));
        this.walkTween = this.scene.tweens.add({ targets: this.chibiContainer, y: -5, duration: 200, yoyo: true, repeat: -1 });

        this.movementTween = this.scene.tweens.add({
            targets: this.container,
            x: x + Phaser.Math.Between(-30, 30),
            y: y - 20 + Phaser.Math.Between(-20, 20),
            duration: Math.max(1000, dist * 2),
            ease: 'Sine.easeInOut',
            onUpdate: (tween) => {
                this.container.setDepth(this.container.y + 100);
                if (onProgress) onProgress(tween.progress);
            },
            onComplete: () => {
                if (this.walkTween) { this.walkTween.stop(); this.chibiContainer.y = 0; }
                this.movementTween = null;
                if (cb) cb();
            }
        });
    }

    returnHome() {
        this.setState(AGENT_STATES.WALKING);
        this.moveTo(this.homePosition.x, this.homePosition.y, () => {
            this.setState(AGENT_STATES.IDLE);
        });
    }

    updateFromState(apiAgent, mapBackendStatus) {
        if (this.isBusy) return;

        const targetState = mapBackendStatus(apiAgent.status);
        if (this.state.id !== targetState.id) {
            this.setState(targetState);
        }
        this.currentTask = apiAgent.current_task;

        // Error indicator (F7: clear graphics before redraw to prevent accumulation)
        if (apiAgent.status === 'error') {
            this.hasError = true;
            if (this.components.bubbleBg) {
                this.components.bubbleBg.clear();
                this.components.bubbleBg.fillStyle(0xffffff, 0.95).fillRoundedRect(-15, -15, 30, 30, 8);
                this.components.bubbleBg.lineStyle(2, 0xff0000, 0.8).strokeRoundedRect(-15, -15, 30, 30, 8);
            }
        } else if (this.hasError) {
            this.hasError = false;
            if (this.components.bubbleBg) {
                this.components.bubbleBg.clear();
                this.components.bubbleBg.fillStyle(0xffffff, 0.95).fillRoundedRect(-15, -15, 30, 30, 8);
                this.components.bubbleBg.lineStyle(2, 0x333333, 0.5).strokeRoundedRect(-15, -15, 30, 30, 8);
            }
        }
    }

    destroy() {
        this.stopAnimations();
        this.container.destroy();
    }
}
