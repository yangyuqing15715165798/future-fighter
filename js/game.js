// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 资源管理器
const resources = {
    sounds: {
        shoot: document.getElementById('shootSound'),
        explosion: document.getElementById('explosionSound'),
        bgm: document.getElementById('bgmSound'),
        // 使用在线音效
        powerup: new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3'),
        levelup: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'),
        achievement: new Audio('https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3'),
        // 新增音效
        coin: new Audio('https://assets.mixkit.co/active_storage/sfx/888/888-preview.mp3'),
        combo: new Audio('https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3'),
        special: new Audio('https://assets.mixkit.co/active_storage/sfx/1995/1995-preview.mp3')
    }
};

// 游戏状态
const GAME_STATE = {
    MENU: 0,
    PLAYING: 1,
    PAUSED: 2,
    GAME_OVER: 3
};

// 添加奖励类型枚举
const POWER_UP_TYPE = {
    DOUBLE_SCORE: 0,
    RAPID_FIRE: 1,
    SHIELD: 2,
    EXTRA_LIFE: 3,    // 额外生命
    INVINCIBLE: 4,    // 无敌状态
    MEGA_BOMB: 5,     // 全屏炸弹
    COIN: 6,          // 金币
    MULTI_SHOT: 7,    // 多重射击
    TIME_SLOW: 8,     // 时间减速
    MAGNET: 9,        // 奖励磁铁
    COMBO_BOOST: 10,  // 连击加成
    SCORE_BURST: 11,  // 得分爆发
    HEALTH_REGEN: 12, // 生命恢复
    DOUBLE_CANNON: 13 // 双管炮
};

// 添加动物类型
const ANIMAL_TYPE = {
    PHOENIX: 0,    // 凤凰 - 无敌状态
    DRAGON: 1,     // 龙 - 全屏炸弹
    TURTLE: 2,     // 神龟 - 额外生命
    TIGER: 3,      // 虎 - 双倍分数
    BIRD: 4,       // 鸟 - 快速射击
    FISH: 5,       // 鱼 - 多重射击
    RABBIT: 6,     // 兔 - 时间减速
    FOX: 7,        // 狐狸 - 奖励磁铁
    WOLF: 8,       // 狼 - 连击加成
    MONKEY: 9,     // 猴 - 得分爆发
    QINGLONG: 10   // 青龙 - 双管炮
};

// 添加动物类
class Animal {
    constructor(type) {
        this.type = type;
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 2;
        this.angle = 0;
        this.amplitude = 100; // 正弦移动的幅度
        this.startX = this.x;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        // 使用emoji绘制
        ctx.font = '30px Arial';  // 调整大小
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 根据类型显示对应的emoji
        switch(this.type) {
            case ANIMAL_TYPE.PHOENIX:
                ctx.fillText('🐦', 0, 0);
                break;
            case ANIMAL_TYPE.DRAGON:
                ctx.fillText('🐲', 0, 0);
                break;
            case ANIMAL_TYPE.TURTLE:
                ctx.fillText('🐢', 0, 0);
                break;
            case ANIMAL_TYPE.TIGER:
                ctx.fillText('🐯', 0, 0);
                break;
            case ANIMAL_TYPE.BIRD:
                ctx.fillText('🦅', 0, 0);
                break;
            case ANIMAL_TYPE.FISH:
                ctx.fillText('🐟', 0, 0);
                break;
            case ANIMAL_TYPE.RABBIT:
                ctx.fillText('🐇', 0, 0);
                break;
            case ANIMAL_TYPE.FOX:
                ctx.fillText('🦊', 0, 0);
                break;
            case ANIMAL_TYPE.WOLF:
                ctx.fillText('🐺', 0, 0);
                break;
            case ANIMAL_TYPE.MONKEY:
                ctx.fillText('🐵', 0, 0);
                break;
            case ANIMAL_TYPE.QINGLONG:
                ctx.fillText('🐉', 0, 0);
                break;
        }
        
        ctx.restore();
    }

    drawFlames() {
        const flames = 5;
        for(let i = 0; i < flames; i++) {
            ctx.beginPath();
            ctx.moveTo(-this.width/2, 0);
            ctx.quadraticCurveTo(
                -this.width/2 - 10 * Math.cos(this.angle + i),
                10 * Math.sin(this.angle + i),
                -this.width/2, 0
            );
            ctx.fillStyle = `rgba(255, ${100 + Math.random() * 155}, 0, 0.5)`;
            ctx.fill();
        }
    }

    drawDragonDetails() {
        // 龙角
        ctx.beginPath();
        ctx.moveTo(-this.width/4, -this.height/4);
        ctx.lineTo(-this.width/3, -this.height/2);
        ctx.lineTo(-this.width/6, -this.height/3);
        ctx.fillStyle = '#aaf';
        ctx.fill();
    }

    drawShellPattern() {
        for(let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, (this.width/2) * (0.5 + i * 0.1),
                    i * Math.PI/3, (i + 1) * Math.PI/3);
            ctx.strokeStyle = '#2a2';
            ctx.stroke();
        }
    }

    drawCatBase() {
        // 基础猫科动物形状
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width/2, this.height/3, 0, 0, Math.PI * 2);
        ctx.fill();
        // 添加耳朵
        ctx.beginPath();
        ctx.moveTo(-this.width/4, -this.height/4);
        ctx.lineTo(-this.width/6, -this.height/2);
        ctx.lineTo(-this.width/8, -this.height/4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.width/4, -this.height/4);
        ctx.lineTo(this.width/6, -this.height/2);
        ctx.lineTo(this.width/8, -this.height/4);
        ctx.fill();
    }

    drawTigerStripes() {
        ctx.strokeStyle = '#c90';
        for(let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(-this.width/3, i * 5);
            ctx.lineTo(this.width/3, i * 5);
            ctx.stroke();
        }
    }

    update() {
        this.y += this.speed;
        // 添加左右摆动的运动
        this.x = this.startX + Math.sin(this.y / 30) * this.amplitude;
    }

    getPowerUpType() {
        switch(this.type) {
            case ANIMAL_TYPE.PHOENIX:
                return POWER_UP_TYPE.INVINCIBLE;
            case ANIMAL_TYPE.DRAGON:
                return POWER_UP_TYPE.MEGA_BOMB;
            case ANIMAL_TYPE.TURTLE:
                return POWER_UP_TYPE.EXTRA_LIFE;
            case ANIMAL_TYPE.TIGER:
                return POWER_UP_TYPE.DOUBLE_SCORE;
            case ANIMAL_TYPE.BIRD:
                return POWER_UP_TYPE.RAPID_FIRE;
            case ANIMAL_TYPE.FISH:
                return POWER_UP_TYPE.MULTI_SHOT;
            case ANIMAL_TYPE.RABBIT:
                return POWER_UP_TYPE.TIME_SLOW;
            case ANIMAL_TYPE.FOX:
                return POWER_UP_TYPE.MAGNET;
            case ANIMAL_TYPE.WOLF:
                return POWER_UP_TYPE.COMBO_BOOST;
            case ANIMAL_TYPE.MONKEY:
                return POWER_UP_TYPE.SCORE_BURST;
            case ANIMAL_TYPE.QINGLONG:
                return POWER_UP_TYPE.DOUBLE_CANNON;
        }
    }

    // 添加碰撞检测方法
    checkBulletCollision(bullet) {
        return (bullet.x < this.x + this.width &&
                bullet.x + bullet.width > this.x &&
                bullet.y < this.y + this.height &&
                bullet.y + bullet.height > this.y);
    }

    // 添加获得奖励效果方法
    grantPowerUp() {
        switch(this.type) {
            case ANIMAL_TYPE.PHOENIX:
                game.shieldTime = Date.now() + 10000;
                game.addMessage("🐦 凤凰祝福：无敌10秒！", 'powerup');
                // 添加凤凰特效
                for(let i = 0; i < 12; i++) {
                    game.powerUpEffects.push(new PowerUpEffect(
                        this.x + this.width/2,
                        this.y + this.height/2,
                        'phoenix',
                        i * (Math.PI * 2 / 12)
                    ));
                }
                break;
            case ANIMAL_TYPE.DRAGON:
                // 清除所有敌机
                game.enemies.forEach(enemy => {
                    game.explosions.push(new Explosion(
                        enemy.x + enemy.width/2,
                        enemy.y + enemy.height/2,
                        'dragon'
                    ));
                    game.score += enemy.score;
                });
                game.enemies = [];
                game.addMessage("🐲 龙之怒：清除敌机！", 'powerup');
                break;
            case ANIMAL_TYPE.TURTLE:
                game.lives = Math.min(game.lives + 1, 5);
                game.addMessage("🐢 神龟护佑：生命值+1！", 'powerup');
                // 添加龟壳防护罩效果
                game.powerUpEffects.push(new PowerUpEffect(
                    game.player.x + game.player.width/2,
                    game.player.y + game.player.height/2,
                    'turtle'
                ));
                break;
            case ANIMAL_TYPE.TIGER:
                game.doubleScoreTime = Date.now() + 15000;
                game.addMessage("🐯 虎啸加持：双倍分数！", 'powerup');
                // 添加金色光环效果
                for(let i = 0; i < 8; i++) {
                    game.powerUpEffects.push(new PowerUpEffect(
                        game.player.x + game.player.width/2,
                        game.player.y + game.player.height/2,
                        'tiger',
                        i * (Math.PI * 2 / 8)
                    ));
                }
                break;
            case ANIMAL_TYPE.BIRD:
                game.rapidFireTime = Date.now() + 8000;
                game.addMessage("🦅 飞鸟之力：快速射击！", 'powerup');
                // 添加羽毛特效
                for(let i = 0; i < 6; i++) {
                    game.powerUpEffects.push(new PowerUpEffect(
                        game.player.x + game.player.width/2,
                        game.player.y + game.player.height/2,
                        'bird',
                        i * (Math.PI * 2 / 6)
                    ));
                }
                break;
            case ANIMAL_TYPE.FISH:
                game.addMessage("获得金币！", 'coin');
                break;
            case ANIMAL_TYPE.RABBIT:
                game.addMessage("获得时间减速！", 'special');
                break;
            case ANIMAL_TYPE.FOX:
                game.addMessage("获得奖励磁铁！", 'special');
                break;
            case ANIMAL_TYPE.WOLF:
                game.addMessage("获得连击加成！", 'special');
                break;
            case ANIMAL_TYPE.MONKEY:
                game.addMessage("获得得分爆发！", 'special');
                break;
            case ANIMAL_TYPE.QINGLONG:
                // 激活双管炮
                game.player.activateDoubleCannon();
                game.addMessage("🐉 青龙赐福：双管炮发射！", 'powerup');
                // 添加双管炮特效
                for(let i = 0; i < 8; i++) {
                    game.powerUpEffects.push(new PowerUpEffect(
                        game.player.x + game.player.width/2,
                        game.player.y + game.player.height/2,
                        'doubleCannon',
                        i * (Math.PI * 2 / 8)
                    ));
                }
                break;
        }
    }
}

// 游戏主对象
const game = {
    state: GAME_STATE.MENU,
    player: null,
    enemies: [],
    explosions: [],
    lastEnemySpawn: 0,
    enemySpawnInterval: 1000,
    score: 0,
    lives: 3,
    powerUps: [],
    doubleScoreTime: 0,
    rapidFireTime: 0,
    shieldTime: 0,
    level: 1,
    enemySpeedMultiplier: 1,
    mobileControls: {
        left: false,
        right: false
    },
    animals: [],
    lastAnimalSpawn: 0,
    animalSpawnInterval: 5000, // 每5秒可能出现一个动物
    frameCount: 0,
    lastTime: 0,
    floatingScores: [],
    powerUpEffects: [],
    highScore: parseInt(localStorage.getItem('highScore')) || 0,
    difficultyLevel: 1,
    combo: 0,
    maxCombo: 0,
    lastKillTime: 0,
    comboTimeout: 1000,
    messages: [],
    
    // 新增奖励系统
    coinSystem: null,
    achievementSystem: null,
    dailyRewardSystem: null,
    missionSystem: null,
    comboSystem: null,
    
    // 游戏统计
    stats: {
        gameTime: 0,
        enemiesKilled: 0,
        powerUpsCollected: 0,
        coinsCollected: 0,
        distanceTraveled: 0
    },
    
    init() {
        this.player = new Player();
        this.enemies = [];
        this.explosions = [];
        this.score = 0;
        this.lives = 3;
        this.level = 1;  // 重置等级
        this.enemySpeedMultiplier = 1;  // 重置敌机速度
        this.enemySpawnInterval = 1000;  // 重置生成间隔
        this.state = GAME_STATE.PLAYING;
        resources.sounds.bgm.play();
        this.powerUps = [];
        this.doubleScoreTime = 0;
        this.rapidFireTime = 0;
        this.shieldTime = 0;
        this.initMobileControls();
        this.animals = [];
        this.lastAnimalSpawn = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.floatingScores = [];
        this.powerUpEffects = [];
        
        // 初始化奖励系统
        this.initRewardSystems();
        
        // 重置游戏统计
        this.stats = {
            gameTime: 0,
            enemiesKilled: 0,
            powerUpsCollected: 0,
            coinsCollected: 0,
            distanceTraveled: 0
        };
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
    },
    
    initMobileControls() {
        // 检测是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const mobileControls = document.getElementById('mobileControls');
        
        if (isMobile) {
            mobileControls.style.display = 'flex';
            
            // 左移按钮
            const leftBtn = document.getElementById('leftBtn');
            leftBtn.addEventListener('touchstart', () => this.mobileControls.left = true);
            leftBtn.addEventListener('touchend', () => this.mobileControls.left = false);
            
            // 右移按钮
            const rightBtn = document.getElementById('rightBtn');
            rightBtn.addEventListener('touchstart', () => this.mobileControls.right = true);
            rightBtn.addEventListener('touchend', () => this.mobileControls.right = false);
            
            // 发射按钮
            const shootBtn = document.getElementById('shootBtn');
            shootBtn.addEventListener('touchstart', () => {
                if (this.state === GAME_STATE.PLAYING) {
                    this.player.shoot();
                    resources.sounds.shoot.currentTime = 0;
                    resources.sounds.shoot.play();
                }
            });
        }
    },
    
    initRewardSystems() {
        // 检查是否已加载奖励系统脚本
        if (window.RewardSystems) {
            this.coinSystem = new window.RewardSystems.CoinSystem();
            this.achievementSystem = new window.RewardSystems.AchievementSystem();
            this.dailyRewardSystem = new window.RewardSystems.DailyRewardSystem();
            this.missionSystem = new window.RewardSystems.MissionSystem();
            this.comboSystem = new window.RewardSystems.ComboSystem();
            
            // 解锁初始成就
            if (this.achievementSystem) {
                this.achievementSystem.unlockAchievement('firstFlight');
            }
            
            // 检查每日奖励
            this.checkDailyReward();
        } else {
            console.warn('奖励系统脚本未加载，功能将受限');
        }
    },
    
    checkDailyReward() {
        // 显示每日奖励提示
        if (this.dailyRewardSystem && this.dailyRewardSystem.canClaimToday()) {
            this.addMessage('🎁 每日奖励可领取！', 'achievement');
            
            // 自动显示每日奖励界面
            setTimeout(() => {
                // 这里可以实现显示每日奖励界面的代码
                this.showDailyRewardUI();
            }, 2000);
        }
    },
    
    showDailyRewardUI() {
        // 暂停游戏
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
        }
        
        // 创建每日奖励界面
        const rewardUI = document.createElement('div');
        rewardUI.className = 'daily-reward-ui';
        rewardUI.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10,25,47,0.9);
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #64ffda;
            color: white;
            text-align: center;
            z-index: 1000;
            font-family: 'Orbitron', sans-serif;
            box-shadow: 0 0 20px rgba(100,255,218,0.5);
            min-width: 300px;
        `;
        
        // 获取奖励信息
        const streak = this.dailyRewardSystem.streak;
        const currentDay = (streak % 7) || 7; // 1-7
        const reward = this.dailyRewardSystem.rewards[currentDay - 1];
        
        rewardUI.innerHTML = `
            <h2 style="color: #64ffda; margin-bottom: 15px;">每日奖励</h2>
            <p>连续登录: ${streak} 天</p>
            <div style="margin: 20px 0; display: flex; justify-content: space-around;">
                ${this.dailyRewardSystem.rewards.map((r, i) => `
                    <div style="
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        background: ${i+1 <= currentDay ? '#64ffda' : 'rgba(100,255,218,0.2)'};
                        color: ${i+1 <= currentDay ? '#0a192f' : '#ccc'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        ${i+1 === currentDay ? 'box-shadow: 0 0 10px #64ffda;' : ''}
                    ">${i+1}</div>
                `).join('')}
            </div>
            <div style="margin: 20px 0;">
                <div style="font-size: 24px; margin-bottom: 10px;">
                    ${reward.coins} 金币 ${reward.extraLife ? '+ 1 条命' : ''}
                </div>
                <div style="font-size: 14px; color: #a8b2d1;">
                    第 ${currentDay} 天奖励
                </div>
            </div>
            <button id="claimRewardBtn" style="
                background: transparent;
                color: #64ffda;
                border: 2px solid #64ffda;
                padding: 10px 30px;
                border-radius: 5px;
                font-family: 'Orbitron', sans-serif;
                cursor: pointer;
                transition: all 0.3s;
                margin-top: 10px;
            ">领取奖励</button>
        `;
        
        document.body.appendChild(rewardUI);
        
        // 添加领取按钮事件
        document.getElementById('claimRewardBtn').addEventListener('click', () => {
            // 领取奖励
            this.dailyRewardSystem.claimDailyReward();
            
            // 移除界面
            document.body.removeChild(rewardUI);
            
            // 恢复游戏
            if (this.state === GAME_STATE.PAUSED) {
                this.state = GAME_STATE.PLAYING;
            }
        });
    },
    
    increaseDifficulty() {
        if (this.score > this.level * 1000) {
            this.level++;
            // 增加敌机速度和生成频率
            this.enemySpeedMultiplier += 0.1;
            this.enemySpawnInterval = Math.max(500, this.enemySpawnInterval - 50);
            
            // 每5级增加一次难度
            if (this.level % 5 === 0) {
                this.difficultyLevel++;
                game.addMessage(`难度提升！第${this.difficultyLevel}阶段！`, 'levelup');
                
                // 根据难度调整敌机生成概率
                if (this.difficultyLevel >= 2) {
                    this.enemySpawnRates = {
                        small: 0.6,    // 降低小型敌机概率
                        medium: 0.3,   // 增加中型敌机概率
                        large: 0.1     // 增加大型敌机概率
                    };
                }
                if (this.difficultyLevel >= 3) {
                    this.enemySpawnRates = {
                        small: 0.5,
                        medium: 0.3,
                        large: 0.2
                    };
                }
            } else {
                game.addMessage(`Level ${this.level}`, 'normal');
            }
        }
    },
    
    cleanup() {
        // 清理超出屏幕的对象
        this.enemies = this.enemies.filter(enemy => enemy.y <= canvas.height);
        this.player.bullets = this.player.bullets.filter(bullet => bullet.y >= 0);
        this.explosions = this.explosions.filter(exp => exp.frame < exp.maxFrame);
        this.animals = this.animals.filter(animal => animal.y <= canvas.height);
        
        // 定期进行垃圾回收
        if (this.frameCount % 1000 === 0) {
            console.log('Performing cleanup...');
            this.enemies.length = Math.min(this.enemies.length, 50);
            this.explosions.length = Math.min(this.explosions.length, 20);
            this.player.bullets.length = Math.min(this.player.bullets.length, 30);
        }
    },
    
    updateCombo() {
        const now = Date.now();
        if (now - this.lastKillTime < this.comboTimeout) {
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
            if (this.combo >= 5) {
                const bonusScore = Math.floor(this.combo * 10);
                this.score += bonusScore;
                showMessage(`${this.combo}连击！奖励${bonusScore}分！`);
                
                // 添加连击特效
                this.powerUpEffects.push(new PowerUpEffect(
                    this.player.x + this.player.width/2,
                    this.player.y - 30,
                    'combo'
                ));
            }
        } else {
            if (this.combo >= 5) {
                showMessage(`连击中断！最高${this.combo}连击！`);
            }
            this.combo = 0;
        }
        this.lastKillTime = now;
    },
    
    addMessage(text, type) {
        this.messages.push(new AdvancedMessage(text, type));
    },
    
    addScore(amount, x, y) {
        // 应用连击倍率
        let finalAmount = amount;
        
        // 如果双倍分数激活
        if (this.doubleScoreTime > Date.now()) {
            finalAmount *= 2;
        }
        
        // 应用连击系统的倍率
        if (this.comboSystem) {
            finalAmount = Math.round(finalAmount * this.comboSystem.getScoreMultiplier());
        }
        
        this.score += finalAmount;
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
        
        // 显示得分浮动文字
        if (finalAmount > 0) {
            let scoreText = `+${finalAmount}`;
            let color = 'white';
            
            // 根据分数大小和倍率变化颜色
            if (finalAmount >= 1000) {
                color = 'gold';
                scoreText = `+${finalAmount} 惊人!`;
            } else if (finalAmount >= 500) {
                color = 'orange';
                scoreText = `+${finalAmount} 精彩!`;
            } else if (finalAmount >= amount * 1.5) {
                color = 'lime';
                scoreText = `+${finalAmount} 连击奖励!`;
            }
            
            if (this.comboSystem && this.comboSystem.combo >= 5) {
                scoreText += ` x${this.comboSystem.combo}`;
            }
            
            // 添加浮动文字
            if (window.RewardSystems) {
                this.floatingScores.push(new window.RewardSystems.FloatingText(x, y, scoreText, color));
            } else {
                this.floatingScores.push(new FloatingScore(x, y, finalAmount));
            }
        }
        
        // 更新任务进度
        if (this.missionSystem) {
            this.missionSystem.updateProgress('reachScore', this.score);
        }
        
        // 更新成就进度
        if (this.achievementSystem) {
            this.achievementSystem.updateProgress('scoreChaser', this.score);
        }
        
        return finalAmount;
    },
    
    enemyKilled(enemy) {
        // 击杀统计
        this.stats.enemiesKilled++;
        
        // 更新连击
        if (this.comboSystem) {
            this.comboSystem.addCombo();
        } else {
            // 使用旧连击系统
            this.updateCombo();
        }
        
        // 随机掉落金币
        if (this.coinSystem && Math.random() < 0.3) {
            const coinAmount = Math.floor(enemy.score / 10) + 1;
            this.coinSystem.addCoins(coinAmount, enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            this.stats.coinsCollected += coinAmount;
            
            // 更新任务进度
            if (this.missionSystem) {
                this.missionSystem.updateProgress('collectCoins', this.stats.coinsCollected);
            }
        }
        
        // 更新任务进度
        if (this.missionSystem) {
            this.missionSystem.incrementProgress('killEnemies');
        }
        
        // 更新成就进度
        if (this.achievementSystem) {
            this.achievementSystem.incrementProgress('sharpShooter');
        }
    },
    
    collectPowerUp(animal) {
        // 增加能力收集统计
        this.stats.powerUpsCollected++;
        
        // 更新任务进度
        if (this.missionSystem) {
            this.missionSystem.incrementProgress('collectPowerups');
        }
        
        // 更新成就进度
        if (this.achievementSystem) {
            this.achievementSystem.incrementProgress('powerCollector');
        }
    },
    
    update(deltaTime) {
        // 更新游戏时间统计
        this.stats.gameTime += deltaTime / 1000;
        
        // 金币系统
        if (this.coinSystem) {
            this.coinSystem.update();
        }
        
        // 连击系统
        if (this.comboSystem) {
            this.comboSystem.update();
        }
        
        // 更新任务进度 - 生存时间
        if (this.missionSystem) {
            this.missionSystem.updateProgress('surviveTime', this.stats.gameTime);
        }
        
        // 更新成就进度 - 生存时间
        if (this.achievementSystem) {
            this.achievementSystem.updateProgress('survivalKing', this.stats.gameTime);
        }
        
        // 更新浮动文字
        this.floatingScores = this.floatingScores.filter(text => {
            if (typeof text.update === 'function') {
                return text.update();
            } else {
                text.y -= text.speed;
                text.life -= 0.02;
                return text.life > 0;
            }
        });
    },
    
    draw() {
        // 绘制奖励系统UI
        if (this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.PAUSED) {
            // 金币系统UI
            if (this.coinSystem) {
                this.coinSystem.draw(ctx);
            }
            
            // 连击系统UI
            if (this.comboSystem) {
                this.comboSystem.draw(ctx);
            }
        }
        
        // 绘制浮动文字
        this.floatingScores.forEach(text => {
            if (typeof text.draw === 'function') {
                text.draw(ctx);
            } else {
                // 兼容旧版
                ctx.save();
                ctx.fillStyle = `rgba(255, 255, 0, ${text.life})`;
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`+${text.score}`, text.x, text.y);
                ctx.restore();
            }
        });
    }
};

// 扩展成就系统
const achievements = {
    data: {
        kills: { small: 0, medium: 0, large: 0 },
        maxCombo: 0,
        totalScore: 0,
        gamesPlayed: 0,
        powerUpsCollected: 0
    },
    
    milestones: {
        '初出茅庐': { score: 1000, achieved: false },
        '战斗专家': { score: 5000, achieved: false },
        '空战王者': { score: 10000, achieved: false },
        '连击大师': { combo: 20, achieved: false },
        '神兽收集者': { powerUps: 50, achieved: false },
        '百战百胜': { kills: 100, achieved: false }
    },
    
    update() {
        // 更新统计数据
        this.data.totalScore = Math.max(this.data.totalScore, game.score);
        this.data.maxCombo = Math.max(this.data.maxCombo, game.maxCombo);
        
        // 检查成就
        for (let [name, milestone] of Object.entries(this.milestones)) {
            if (!milestone.achieved) {
                if ((milestone.score && game.score >= milestone.score) ||
                    (milestone.combo && game.maxCombo >= milestone.combo) ||
                    (milestone.powerUps && this.data.powerUpsCollected >= milestone.powerUps) ||
                    (milestone.kills && this.data.kills.total >= milestone.kills)) {
                    
                    milestone.achieved = true;
                    this.showAchievement(name);
                }
            }
        }
        
        // 保存成就数据
        localStorage.setItem('achievements', JSON.stringify(this.data));
    }
};

// 玩家飞机类
class Player {
    constructor() {
        this.width = 40;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 5;
        this.bullets = [];
        this.engineFlame = 0;
        this.isInvulnerable = false;
        this.invulnerableTime = 0;
        // 添加双管炮属性
        this.hasDoubleCannon = false;
        this.doubleCannonTime = 0;
        this.skills = {
            bomb: {
                count: 3,
                cooldown: false,
                key: 'B',
                icon: '💣'
            },
            slowTime: {
                count: 2,
                cooldown: false,
                duration: 5000,
                key: 'V',
                icon: '⌛'
            },
            shield: {
                count: 1,
                cooldown: false,
                duration: 3000,
                key: 'C',
                icon: '🛡️'
            },
            doubleCannon: {
                count: 3,
                cooldown: false,
                duration: 10000,
                key: 'X',
                icon: '🔫'
            }
        };
    }

    draw() {
        ctx.save();
        
        // 无敌状态闪烁效果
        if (this.isInvulnerable && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // 绘制引擎火焰动画
        this.engineFlame = (this.engineFlame + 0.2) % 2;
        const flameHeight = 10 + Math.sin(this.engineFlame * Math.PI) * 5;
        
        // 绘制引擎火焰
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.3, this.y + this.height);
        ctx.lineTo(this.x + this.width * 0.5, this.y + this.height + flameHeight);
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height);
        ctx.fillStyle = '#ff6600';
        ctx.fill();
        
        // 绘制飞机主体（更细的战斗机形状）
        ctx.beginPath();
        // 机头
        ctx.moveTo(this.x + this.width * 0.5, this.y);
        // 右翼
        ctx.lineTo(this.x + this.width * 0.9, this.y + this.height * 0.6);
        ctx.lineTo(this.x + this.width, this.y + this.height * 0.8);
        ctx.lineTo(this.x + this.width * 0.8, this.y + this.height);
        // 尾部
        ctx.lineTo(this.x + this.width * 0.2, this.y + this.height);
        // 左翼
        ctx.lineTo(this.x, this.y + this.height * 0.8);
        ctx.lineTo(this.x + this.width * 0.1, this.y + this.height * 0.6);
        ctx.closePath();
        
        // 飞机渐变色
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#8af');
        gradient.addColorStop(1, '#48f');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 添加机身细节
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 如果有双管炮，绘制额外的炮管
        if (this.hasDoubleCannon) {
            // 左炮管
            ctx.beginPath();
            ctx.rect(this.x + this.width * 0.2, this.y, 3, 10);
            ctx.fillStyle = '#ffcc00';
            ctx.fill();
            
            // 右炮管
            ctx.beginPath();
            ctx.rect(this.x + this.width * 0.8 - 3, this.y, 3, 10);
            ctx.fillStyle = '#ffcc00';
            ctx.fill();
            
            // 双管炮发光效果
            if (Math.random() > 0.7) {
                ctx.beginPath();
                ctx.arc(this.x + this.width * 0.2 + 1.5, this.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(this.x + this.width * 0.8 - 1.5, this.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                ctx.fill();
            }
        }
        
        ctx.restore();
    }

    shoot() {
        if (this.hasDoubleCannon) {
            // 双管炮发射
            this.bullets.push(new Bullet(this.x + this.width * 0.2, this.y));
            this.bullets.push(new Bullet(this.x + this.width * 0.8, this.y));
            
            // 如果同时有快速射击状态，则额外发射中间一发
            if (game.rapidFireTime > Date.now()) {
                this.bullets.push(new Bullet(this.x + this.width / 2, this.y - 5));
            }
        } else {
            // 普通发射
            this.bullets.push(new Bullet(this.x + this.width / 2, this.y));
            
            // 快速射击状态下额外发射两颗子弹
            if (game.rapidFireTime > Date.now()) {
                this.bullets.push(new Bullet(this.x + this.width / 4, this.y));
                this.bullets.push(new Bullet(this.x + this.width * 3/4, this.y));
            }
        }
    }

    hit() {
        if (!this.isInvulnerable && game.shieldTime < Date.now()) {
            game.lives--;
            if (game.lives <= 0) {
                game.state = GAME_STATE.GAME_OVER;
                return;
            }
            this.isInvulnerable = true;
            setTimeout(() => this.isInvulnerable = false, 2000);
        }
    }

    useBomb() {
        if (this.skills.bomb.count > 0 && !this.skills.bomb.cooldown) {
            this.skills.bomb.count--;
            game.enemies.forEach(enemy => {
                game.explosions.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2));
                game.score += enemy.score;
            });
            game.enemies = [];
            
            this.skills.bomb.cooldown = true;
            setTimeout(() => this.skills.bomb.cooldown = false, 5000);
        }
    }

    useSkill(skillName) {
        const skill = this.skills[skillName];
        if (skill && skill.count > 0 && !skill.cooldown) {
            skill.count--;
            skill.cooldown = true;
            
            switch(skillName) {
                case 'bomb':
                    this.activateBomb();
                    break;
                case 'slowTime':
                    this.activateSlowTime();
                    break;
                case 'shield':
                    this.activateShield();
                    break;
                case 'doubleCannon':
                    this.activateDoubleCannon();
                    break;
            }
            
            // 显示技能效果
            game.addMessage(`使用技能：${skill.icon}`);
            
            // 设置冷却
            setTimeout(() => {
                skill.cooldown = false;
                game.addMessage(`${skill.icon}技能冷却完成！`);
            }, 10000);
        }
    }

    // 技能效果实现
    activateBomb() {
        game.enemies.forEach(enemy => {
            game.explosions.push(new Explosion(
                enemy.x + enemy.width/2,
                enemy.y + enemy.height/2
            ));
            game.score += enemy.score;
        });
        game.enemies = [];
    }
    
    activateSlowTime() {
        const originalSpeed = game.enemySpeedMultiplier;
        game.enemySpeedMultiplier *= 0.5;
        setTimeout(() => {
            game.enemySpeedMultiplier = originalSpeed;
        }, this.skills.slowTime.duration);
    }
    
    activateShield() {
        this.isInvulnerable = true;
        setTimeout(() => {
            this.isInvulnerable = false;
        }, this.skills.shield.duration);
    }

    // 添加激活双管炮方法
    activateDoubleCannon() {
        this.hasDoubleCannon = true;
        this.doubleCannonTime = Date.now() + this.skills.doubleCannon.duration;
        
        // 添加双管炮特效
        for (let i = 0; i < 8; i++) {
            game.powerUpEffects.push(new PowerUpEffect(
                this.x + this.width/2,
                this.y + this.height/2,
                'doubleCannon',
                i * (Math.PI * 2 / 8)
            ));
        }
        
        // 定时关闭双管炮
        setTimeout(() => {
            this.hasDoubleCannon = false;
            game.addMessage("双管炮能量耗尽！", 'normal');
        }, this.skills.doubleCannon.duration);
    }
    
    update() {
        // 更新双管炮状态
        if (this.hasDoubleCannon && Date.now() > this.doubleCannonTime) {
            this.hasDoubleCannon = false;
        }
    }
}

// 敌机类
class Enemy {
    constructor(type) {
        this.type = type;
        this.setupType();
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.rotationAngle = 0;
    }

    setupType() {
        switch(this.type) {
            case 1:  // 小型敌机
                this.width = 30;
                this.height = 30;
                this.speed = 3;
                this.hp = 1;     // 所有敌机生命值都设为1
                this.score = 100;
                this.color = '#ff4444';
                break;
            case 2:  // 中型敌机
                this.width = 40;
                this.height = 40;
                this.speed = 2;
                this.hp = 1;     // 改为1
                this.score = 300;
                this.color = '#ff0000';
                break;
            case 3:  // 大型敌机
                this.width = 60;
                this.height = 60;
                this.speed = 1;
                this.hp = 1;     // 改为1
                this.score = 500;
                this.color = '#990000';
                break;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        this.rotationAngle += 0.02;
        ctx.rotate(Math.PI); // 旋转180度，使敌机朝下
        
        // 根据类型绘制不同的敌机形状
        switch(this.type) {
            case 1: // 小型战斗机
                this.drawFighter(this.width, '#f44');
                break;
            case 2: // 中型战斗机
                this.drawBomber(this.width, '#f22');
                break;
            case 3: // 大型战斗机
                this.drawBoss(this.width, '#900');
                break;
        }
        
        ctx.restore();
    }

    drawFighter(size, color) {
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/4, -size/4);
        ctx.lineTo(size/4, size/4);
        ctx.lineTo(0, size/2);
        ctx.lineTo(-size/4, size/4);
        ctx.lineTo(-size/4, -size/4);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    drawBomber(size, color) {
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/2, 0);
        ctx.lineTo(size/3, size/2);
        ctx.lineTo(-size/3, size/2);
        ctx.lineTo(-size/2, 0);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    drawBoss(size, color) {
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/2, -size/4);
        ctx.lineTo(size/2, size/4);
        ctx.lineTo(size/4, size/2);
        ctx.lineTo(-size/4, size/2);
        ctx.lineTo(-size/2, size/4);
        ctx.lineTo(-size/2, -size/4);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    update() {
        this.y += this.speed * game.enemySpeedMultiplier;
    }

    hit() {
        // 直接返回true表示被击中就爆炸
        return true;
    }
}

// 子弹类
class Bullet {
    constructor(x, y) {
        this.width = 4;
        this.height = 12;
        this.x = x - this.width / 2;
        this.y = y;
        this.speed = 7;
    }

    draw() {
        ctx.save();
        
        // 绘制子弹光晕
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                this.width * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fill();
        
        // 绘制子弹主体
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }
}

// 爆炸效果类
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.maxFrame = 10;
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.frame * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${255 - this.frame * 25}, 0, ${1 - this.frame/this.maxFrame})`;
        ctx.fill();
        this.frame++;
        ctx.restore();
    }
}

// 添加浮动分数类
class FloatingScore {
    constructor(x, y, score) {
        this.x = x;
        this.y = y;
        this.score = score;
        this.life = 1; // 生命周期，1到0
        this.speed = 1;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 0, ${this.life})`;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`+${this.score}`, this.x, this.y);
        ctx.restore();
        
        this.y -= this.speed;
        this.life -= 0.02;
    }
}

// 添加奖励特效类
class PowerUpEffect {
    constructor(x, y, type, angle = 0) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.angle = angle;
        this.radius = 0;
        this.maxRadius = 50;
        this.life = 1;
        this.rotation = 0;
    }

    draw() {
        ctx.save();
        
        switch(this.type) {
            case 'phoenix':
                this.drawPhoenixEffect();
                break;
            case 'dragon':
                this.drawDragonEffect();
                break;
            case 'turtle':
                this.drawTurtleEffect();
                break;
            case 'tiger':
                this.drawTigerEffect();
                break;
            case 'bird':
                this.drawBirdEffect();
                break;
            case 'doubleCannon':
                this.drawDoubleCannonEffect();
                break;
            case 'combo':
                this.drawComboEffect();
                break;
        }
        
        ctx.restore();
        
        // 更新效果
        this.radius += (this.maxRadius - this.radius) * 0.1;
        this.life -= 0.02;
        this.rotation += 0.1;
    }

    drawPhoenixEffect() {
        // 火焰特效
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + this.rotation);
        
        const gradient = ctx.createLinearGradient(0, 0, this.radius, 0);
        gradient.addColorStop(0, `rgba(255, 69, 0, ${this.life})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
            this.radius * 0.5, Math.sin(this.rotation) * 20,
            this.radius, 0
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawDragonEffect() {
        // 龙形能量波
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `rgba(0, 191, 255, ${this.life})`);
        gradient.addColorStop(0.5, `rgba(0, 191, 255, ${this.life * 0.5})`);
        gradient.addColorStop(1, `rgba(0, 191, 255, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    drawTurtleEffect() {
        // 龟壳防护罩
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        for(let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(
                Math.cos(angle) * this.radius,
                Math.sin(angle) * this.radius,
                5,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(50, 205, 50, ${this.life})`;
            ctx.fill();
        }
        
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(50, 205, 50, ${this.life})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawTigerEffect() {
        // 金色光环
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + this.rotation);
        
        const gradient = ctx.createLinearGradient(0, 0, this.radius, 0);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${this.life})`);
        gradient.addColorStop(1, `rgba(255, 215, 0, 0)`);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.radius, 0);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawBirdEffect() {
        // 羽毛特效
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + this.rotation);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
            this.radius * 0.5, Math.sin(this.rotation) * 10,
            this.radius, 0
        );
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.life})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // 连击特效
    drawComboEffect() {
        ctx.translate(this.x, this.y);
        
        // 爆炸效果
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, `rgba(255, 255, 0, ${this.life})`);
        gradient.addColorStop(0.7, `rgba(255, 165, 0, ${this.life * 0.7})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 爆炸星形
        const spikes = 8;
        const outerRadius = this.radius * 1.2;
        const innerRadius = this.radius * 0.8;
        
        ctx.beginPath();
        for(let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (spikes * 2)) * Math.PI * 2;
            if (i === 0) {
                ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            } else {
                ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.life * 0.5})`;
        ctx.fill();
    }

    // 添加双管炮特效
    drawDoubleCannonEffect() {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + this.rotation);
        
        const gradient = ctx.createLinearGradient(0, 0, 0, this.radius);
        gradient.addColorStop(0, 'rgba(255, 215, 0, ' + this.life * 0.7 + ')');
        gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
        
        // 绘制光束效果
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-5, this.radius);
        ctx.lineTo(5, this.radius);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 绘制能量球
        ctx.beginPath();
        ctx.arc(0, this.radius * 0.6, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, ' + this.life * 0.9 + ')';
        ctx.fill();
        
        // 绘制闪光
        if (Math.random() > 0.5) {
            ctx.beginPath();
            ctx.moveTo(0, this.radius * 0.6);
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2 / 5) + this.rotation;
                const innerRadius = 4;
                const outerRadius = 12;
                
                ctx.lineTo(
                    Math.cos(angle) * outerRadius,
                    this.radius * 0.6 + Math.sin(angle) * outerRadius
                );
                
                const nextAngle = ((i + 0.5) * Math.PI * 2 / 5) + this.rotation;
                ctx.lineTo(
                    Math.cos(nextAngle) * innerRadius,
                    this.radius * 0.6 + Math.sin(nextAngle) * innerRadius
                );
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 200, ' + this.life * 0.8 + ')';
            ctx.fill();
        }
    }
}

// 添加高级消息提示类
class AdvancedMessage {
    constructor(text, type = 'normal') {
        this.text = text;
        this.type = type;
        this.life = 1;
        this.scale = 0;
        this.rotation = 0;
        this.y = canvas.height / 2;
        this.opacity = 0;
        this.particles = [];
        this.createParticles();
    }

    createParticles() {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                speed: Math.random() * 4 + 2,
                angle: (Math.PI * 2 * i) / particleCount,
                size: Math.random() * 3 + 1,
                color: this.getTypeColor(),
                alpha: 1
            });
        }
    }

    getTypeColor() {
        switch(this.type) {
            case 'levelup':
                return '#64ffda';
            case 'achievement':
                return '#ffd700';
            case 'warning':
                return '#ff4444';
            case 'powerup':
                return '#4488ff';
            default:
                return '#ffffff';
        }
    }

    draw() {
        ctx.save();
        
        // 绘制粒子效果
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.fillStyle = `rgba(${this.hexToRgb(particle.color)},${particle.alpha})`;
            ctx.arc(
                particle.x + Math.cos(particle.angle) * (particle.speed * 20),
                particle.y + Math.sin(particle.angle) * (particle.speed * 20),
                particle.size,
                0,
                Math.PI * 2
            );
            ctx.fill();
            particle.alpha *= 0.95;
        });

        // 设置文字样式
        ctx.translate(canvas.width / 2, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // 绘制发光效果
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.getTypeColor();
        
        // 绘制文字边框
        ctx.strokeStyle = this.getTypeColor();
        ctx.lineWidth = 2;
        ctx.font = 'bold 30px Orbitron';
        ctx.textAlign = 'center';
        ctx.globalAlpha = this.opacity;
        ctx.strokeText(this.text, 0, 0);
        
        // 绘制文字
        ctx.fillStyle = '#fff';
        ctx.fillText(this.text, 0, 0);
        
        ctx.restore();
        
        // 更新动画参数
        this.update();
    }

    update() {
        if (this.life > 0.7) {
            // 出现动画
            this.scale = this.easeOutBack(1 - (this.life - 0.7) / 0.3);
            this.opacity = this.easeOutBack(1 - (this.life - 0.7) / 0.3);
            this.rotation = (1 - this.life) * Math.PI / 6;
        } else if (this.life < 0.3) {
            // 消失动画
            this.scale = this.easeInBack(this.life / 0.3);
            this.opacity = this.life / 0.3;
        } else {
            // 保持显示
            this.scale = 1;
            this.opacity = 1;
            this.rotation = 0;
        }
        
        this.life -= 0.01;
    }

    // 缓动函数
    easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    easeInBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * x * x * x - c1 * x * x;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : 
            '255,255,255';
    }
}

// 修改 updateAndDraw 函数
function updateAndDraw(deltaTime) {
    try {
        // 更新玩家位置
        if (keys['ArrowLeft'] || game.mobileControls.left) {
            game.player.x = Math.max(0, game.player.x - game.player.speed * (deltaTime/16));
        }
        if (keys['ArrowRight'] || game.mobileControls.right) {
            game.player.x = Math.min(canvas.width - game.player.width, 
                                    game.player.x + game.player.speed * (deltaTime/16));
        }

        // 生成敌机
        if (Date.now() - game.lastEnemySpawn > game.enemySpawnInterval) {
            const rand = Math.random();
            let type;
            if (rand < 0.7) type = 1;        // 70% 几率出现小型敌机
            else if (rand < 0.9) type = 2;    // 20% 几率出现中型敌机
            else type = 3;                    // 10% 几率出现大型敌机
            
            game.enemies.push(new Enemy(type));
            game.lastEnemySpawn = Date.now();
        }

        // 生成动物
        if (Date.now() - game.lastAnimalSpawn > game.animalSpawnInterval) {
            if (Math.random() < 0.3) { // 30%概率生成动物
                const animalType = Math.floor(Math.random() * 5);
                game.animals.push(new Animal(animalType));
            }
            game.lastAnimalSpawn = Date.now();
        }

        // 更新和绘制游戏对象
        // 绘制玩家
        game.player.draw();

        // 更新和绘制子弹
        game.player.bullets.forEach((bullet, bulletIndex) => {
            bullet.y -= bullet.speed;
            bullet.draw();
            
            if (bullet.y < 0) {
                game.player.bullets.splice(bulletIndex, 1);
                return;
            }

            // 检测子弹击中神兽
            game.animals.forEach((animal, animalIndex) => {
                if (animal.checkBulletCollision(bullet)) {
                    game.player.bullets.splice(bulletIndex, 1);
                    animal.grantPowerUp();
                    game.animals.splice(animalIndex, 1);
                    // 播放获得奖励音效
                    if (resources.sounds.powerup) {
                        resources.sounds.powerup.currentTime = 0;
                        resources.sounds.powerup.play();
                    }
                }
            });

            // 检测子弹击中敌机
            game.enemies.forEach((enemy, enemyIndex) => {
                if (bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    
                    // 移除子弹
                    game.player.bullets.splice(bulletIndex, 1);
                    
                    // 直接处理爆炸和得分
                    game.explosions.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2));
                    const scoreGained = enemy.score * (game.doubleScoreTime > Date.now() ? 2 : 1);
                    game.score += scoreGained;
                    
                    // 添加浮动分数
                    game.floatingScores.push(new FloatingScore(
                        enemy.x + enemy.width/2,
                        enemy.y,
                        scoreGained
                    ));
                    
                    // 移除敌机
                    game.enemies.splice(enemyIndex, 1);
                    
                    // 播放爆炸音效
                    resources.sounds.explosion.currentTime = 0;
                    resources.sounds.explosion.play();
                }
            });
        });

        // 更新和绘制敌机
        game.enemies.forEach((enemy, index) => {
            enemy.update();
            enemy.draw();
            
            // 删除超出屏幕的敌机
            if (enemy.y > canvas.height) {
                game.enemies.splice(index, 1);
            }

            // 检测与玩家碰撞
            if (game.player.x < enemy.x + enemy.width &&
                game.player.x + game.player.width > enemy.x &&
                game.player.y < enemy.y + enemy.height &&
                game.player.y + game.player.height > enemy.y) {
                game.player.hit();
            }
        });

        // 更新和绘制动物
        game.animals.forEach((animal, index) => {
            animal.update();
            animal.draw();

            // 检测玩家是否接触到动物
            if (game.player.x < animal.x + animal.width &&
                game.player.x + game.player.width > animal.x &&
                game.player.y < animal.y + animal.height &&
                game.player.y + game.player.height > animal.y) {
                
                // 根据动物类型给予不同奖励
                switch(animal.getPowerUpType()) {
                    case POWER_UP_TYPE.INVINCIBLE:
                        game.shieldTime = Date.now() + 10000; // 10秒无敌
                        game.addMessage("获得凤凰祝福：10秒无敌！", 'powerup');
                        game.powerUpEffects.push(new PowerUpEffect(
                            game.player.x + game.player.width/2,
                            game.player.y + game.player.height/2,
                            POWER_UP_TYPE.INVINCIBLE
                        ));
                        break;
                    case POWER_UP_TYPE.MEGA_BOMB:
                        // 清除所有敌机
                        game.enemies.forEach(enemy => {
                            game.explosions.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2));
                            game.score += enemy.score;
                        });
                        game.enemies = [];
                        game.addMessage("获得龙之怒：清除所有敌机！", 'powerup');
                        showMessage("获得龙之怒：清除所有敌机！");
                        break;
                    case POWER_UP_TYPE.EXTRA_LIFE:
                        game.lives = Math.min(game.lives + 1, 5); // 最多5条命
                        showMessage("获得神龟护佑：生命值+1！");
                        break;
                    case POWER_UP_TYPE.DOUBLE_SCORE:
                        game.doubleScoreTime = Date.now() + 15000; // 15秒双倍分数
                        showMessage("获得虎啸加持：15秒双倍分数！");
                        break;
                    case POWER_UP_TYPE.RAPID_FIRE:
                        game.rapidFireTime = Date.now() + 8000; // 8秒快速射击
                        showMessage("获得飞鸟之力：8秒快速射击！");
                        break;
                    case POWER_UP_TYPE.COIN:
                        game.addMessage("获得金币！", 'coin');
                        break;
                    case POWER_UP_TYPE.MULTI_SHOT:
                        game.addMessage("获得多重射击！", 'special');
                        break;
                    case POWER_UP_TYPE.TIME_SLOW:
                        game.addMessage("获得时间减速！", 'special');
                        break;
                    case POWER_UP_TYPE.MAGNET:
                        game.addMessage("获得奖励磁铁！", 'special');
                        break;
                    case POWER_UP_TYPE.COMBO_BOOST:
                        game.addMessage("获得连击加成！", 'special');
                        break;
                    case POWER_UP_TYPE.SCORE_BURST:
                        game.addMessage("获得得分爆发！", 'special');
                        break;
                    case POWER_UP_TYPE.HEALTH_REGEN:
                        game.lives = Math.min(game.lives + 1, 5);
                        showMessage("生命值恢复！");
                        break;
                }
                
                game.animals.splice(index, 1);
            }
            
            // 删除超出屏幕的动物
            if (animal.y > canvas.height) {
                game.animals.splice(index, 1);
            }
        });

        // 更新和绘制爆炸效果
        game.explosions.forEach((explosion, index) => {
            explosion.draw();
            if (explosion.frame >= explosion.maxFrame) {
                game.explosions.splice(index, 1);
            }
        });

        // 更新和绘制浮动分数
        game.floatingScores = game.floatingScores.filter(score => {
            if (score.life > 0) {
                score.draw();
                return true;
            }
            return false;
        });

        // 更新和绘制奖励特效
        game.powerUpEffects = game.powerUpEffects.filter(effect => {
            if (effect.life > 0) {
                effect.draw();
                return true;
            }
            return false;
        });

        // 绘制UI
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`分数: ${game.score}`, 10, 30);
        ctx.fillText(`生命: ${game.lives}`, 10, 60);
        ctx.fillText(`等级: ${game.level}`, 10, 90);

        // 显示当前激活奖励状态
        let statusY = 120;
        if (game.doubleScoreTime > Date.now()) {
            ctx.fillText('双倍分数!', 10, statusY);
            statusY += 30;
        }
        if (game.rapidFireTime > Date.now()) {
            ctx.fillText('快速射击!', 10, statusY);
            statusY += 30;
        }
        if (game.shieldTime > Date.now()) {
            ctx.fillText('护盾激活!', 10, statusY);
        }

        // 检查难度提升
        game.increaseDifficulty();
        
        // 清理对象
        game.cleanup();

    } catch (error) {
        console.error('Game update error:', error);
    }
}

// 修改 gameLoop 函数
function gameLoop(currentTime) {
    if (!currentTime) currentTime = performance.now();
    
    if (game.state === GAME_STATE.PLAYING) {
        // 计算帧率
        const deltaTime = currentTime - game.lastTime;
        game.lastTime = currentTime;
        
        // 清理画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 更新和绘制游戏
        updateAndDraw(deltaTime);
        
        // 继续游戏循环
        requestAnimationFrame(gameLoop);
    } else if (game.state === GAME_STATE.GAME_OVER) {
        drawGameOver();
    } else if (game.state === GAME_STATE.PAUSED) {
        drawPause();
    }
}

// 添加游戏结束画面
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width/2, canvas.height/2 - 100);
    
    ctx.font = '24px Arial';
    // 显示本局得分
    ctx.fillText(`本局得分: ${game.score}`, canvas.width/2, canvas.height/2 - 50);
    // 显示历史最高分
    ctx.fillStyle = game.score > game.highScore ? '#ffff00' : '#fff';
    ctx.fillText(`历史最高: ${Math.max(game.score, game.highScore)}`, canvas.width/2, canvas.height/2 - 20);
    // 显示本局等级
    ctx.fillStyle = '#fff';
    ctx.fillText(`达到等级: ${game.level}`, canvas.width/2, canvas.height/2 + 10);
    
    // 如果打破记录，显示提
    if (game.score > game.highScore) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('新纪录！', canvas.width/2, canvas.height/2 + 40);
    }
    
    // 绘制重新开始按钮
    const btnY = canvas.height/2 + 80;
    const btnWidth = 200;
    const btnHeight = 50;
    const btnX = canvas.width/2 - btnWidth/2;
    
    // 绘制按钮背景
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
    
    // 绘制按钮文字
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('重新开始', canvas.width/2, btnY + btnHeight/2 + 8);
    
    // 添加点击/触摸事件监听
    const handleRestart = (event) => {
        const rect = canvas.getBoundingClientRect();
        let x, y;
        
        if (event.type === 'touchend') {
            const touch = event.changedTouches[0];
            x = touch.clientX - rect.left;
            y = touch.clientY - rect.top;
        } else {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }
        
        if (x >= btnX && x <= btnX + btnWidth &&
            y >= btnY && y <= btnY + btnHeight) {
            canvas.removeEventListener('click', handleRestart);
            canvas.removeEventListener('touchend', handleRestart);
            startGame();
        }
    };
    
    canvas.addEventListener('click', handleRestart);
    canvas.addEventListener('touchend', handleRestart);
}

// 添加暂停画面
function drawPause() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏暂停', canvas.width/2, canvas.height/2);
    ctx.font = '20px Arial';
    ctx.fillText('按ESC继续', canvas.width/2, canvas.height/2 + 40);
}

// 开始界面
function drawMenu() {
    ctx.fillStyle = '#000';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('飞机大战', canvas.width/2, canvas.height/2 - 50);
    ctx.font = '20px Arial';
    ctx.fillText('点击开始游戏', canvas.width/2, canvas.height/2);
    ctx.fillText('使用方向键移动，空格键发射', canvas.width/2, canvas.height/2 + 30);
}

// 初始化
function init() {
    const startButton = document.getElementById('startButton');
    
    startButton.addEventListener('click', () => {
        startGame();
    });
    
    // 设置初始游戏状态
    game.state = GAME_STATE.MENU;
    drawMenu();
}

// 开始游戏
function startGame() {
    // 隐藏菜单
    const gameMenu = document.getElementById('gameMenu');
    gameMenu.style.display = 'none';
    
    // 更新最高分（如果需要）
    if (game.score > game.highScore) {
        game.highScore = game.score;
        localStorage.setItem('highScore', game.highScore);
    }
    
    // 初始化游戏
    game.init();
    
    // 设置初始状态
    game.state = GAME_STATE.PLAYING;
    game.lastTime = performance.now();
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 初始化戏
init();

// 添加游戏状态恢复函数
function recoverGameState() {
    if (game.state === GAME_STATE.PLAYING) {
        // 清理可能导致问题的对象
        game.enemies = [];
        game.explosions = [];
        game.player.bullets = [];
        game.animals = [];
        
        // 重置计时器
        game.lastTime = performance.now();
        game.frameCount = 0;
        
        // 重新开始游戏循环
        requestAnimationFrame(gameLoop);
    }
}

// 添加可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (game.state === GAME_STATE.PLAYING) {
            game.state = GAME_STATE.PAUSED;
            resources.sounds.bgm.pause();
        }
    } else {
        if (game.state === GAME_STATE.PAUSED) {
            game.lastTime = performance.now();
            game.state = GAME_STATE.PLAYING;
            resources.sounds.bgm.play();
            requestAnimationFrame(gameLoop);
        }
    }
});

// 在文件顶部添加键盘控制
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        if (game.state === GAME_STATE.PLAYING) {
            game.player.shoot();
            resources.sounds.shoot.currentTime = 0;
            resources.sounds.shoot.play();
        }
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);

// 添加消息提示函数
function showMessage(text) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.9);
        color: #000;
        padding: 15px 30px;
        border-radius: 5px;
        font-size: 18px;
        pointer-events: none;
        z-index: 1000;
        animation: messageAnim 2s forwards;
    `;
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes messageAnim {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
            20% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 1;
            }
            30% {
                transform: translate(-50%, -50%) scale(1);
            }
            80% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    message.textContent = text;
    document.body.appendChild(message);
    setTimeout(() => {
        message.remove();
        style.remove();
    }, 2000);
}

// 添加错误处理
window.addEventListener('error', function(e) {
    console.error('Game error caught:', e);
    if (game.state === GAME_STATE.PLAYING) {
        recoverGameState();
    }
});

// 添加游戏状态检查
setInterval(() => {
    if (game.state === GAME_STATE.PLAYING && !document.hidden) {
        const currentTime = performance.now();
        if (currentTime - game.lastTime > 1000) {
            console.log('Game loop stopped, attempting to restart...');
            recoverGameState();
        }
    }
}, 1000);

// 修改音效管理器
const SoundManager = {
    bgm: {
        normal: document.getElementById('bgmSound'),
        boss: new Audio('https://assets.mixkit.co/active_storage/sfx/2191/2191-preview.mp3')
    },
    effects: {
        shoot: document.getElementById('shootSound'),
        explosion: document.getElementById('explosionSound'),
        powerup: new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3'),
        achievement: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'),
        levelup: new Audio('https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3')
    },
    volume: 0.7,
    
    init() {
        // 设置所有音频为循环播放
        this.bgm.normal.loop = true;
        
        // 预加载所有音效
        Object.values(this.effects).forEach(sound => {
            if (sound) {
                sound.load();
            }
        });
        
        // 设置初始音量
        this.setVolume(this.volume);
        
        // 添加音量控制
        document.addEventListener('keydown', (e) => {
            if (e.key === '+' || e.key === '=') {
                this.adjustVolume(0.1);
            } else if (e.key === '-') {
                this.adjustVolume(-0.1);
            } else if (e.key === 'M' || e.key === 'm') {
                this.toggleMute();
            }
        });
    },
    
    // 添加静音切换功能
    toggleMute() {
        if (this.volume > 0) {
            this.previousVolume = this.volume;
            this.setVolume(0);
        } else {
            this.setVolume(this.previousVolume || 0.7);
        }
        showMessage(`音量: ${Math.round(this.volume * 100)}%`);
    },
    
    // 播放音效的统一接口
    play(soundName) {
        const sound = this.effects[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Audio play failed:', e));
        }
    },
    
    // 切换背景音乐
    switchBGM(type = 'normal') {
        Object.values(this.bgm).forEach(music => {
            music.pause();
            music.currentTime = 0;
        });
        const music = this.bgm[type];
        if (music) {
            music.play().catch(e => console.log('BGM play failed:', e));
        }
    },
    
    adjustVolume(delta) {
        this.volume = Math.max(0, Math.min(1, this.volume + delta));
        this.setVolume(this.volume);
        showMessage(`音量: ${Math.round(this.volume * 100)}%`);
    },
    
    setVolume(volume) {
        Object.values(this.bgm).forEach(music => {
            if (music) music.volume = volume;
        });
        Object.values(this.effects).forEach(sound => {
            if (sound) sound.volume = volume;
        });
        localStorage.setItem('gameVolume', volume);
    }
};

// 初始化音效管理器
SoundManager.init();

// 添加移动端手势控制
function initTouchControls() {
    let startX = 0;
    let startY = 0;
    let isSwiping = false;
    
    canvas.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = false;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (!isSwiping) {
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;
            
            if (Math.abs(deltaX) > 10) { // 防止微小移动
                game.player.x += deltaX * 0.5;
                game.player.x = Math.max(0, Math.min(
                    canvas.width - game.player.width,
                    game.player.x
                ));
                startX = e.touches[0].clientX;
                isSwiping = true;
            }
        }
        e.preventDefault(); // 防止页面滚动
    });
    
    // 添加双击暂停
    let lastTap = 0;
    canvas.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            togglePause();
        }
        lastTap = now;
        isSwiping = false;
    });
}

// 初始化移动端控制
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    initTouchControls();
}

// 添加暂停切换函数
function togglePause() {
    if (game.state === GAME_STATE.PLAYING) {
        game.state = GAME_STATE.PAUSED;
        resources.sounds.bgm.pause();
    } else if (game.state === GAME_STATE.PAUSED) {
        game.state = GAME_STATE.PLAYING;
        resources.sounds.bgm.play();
        requestAnimationFrame(gameLoop);
    }
}