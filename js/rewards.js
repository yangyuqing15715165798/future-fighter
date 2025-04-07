/**
 * 奖励系统 - 为游戏添加多种奖励机制
 */

// 金币系统
class CoinSystem {
    constructor() {
        this.coins = 0;
        this.totalCoins = parseInt(localStorage.getItem('totalCoins')) || 0;
        this.coinParticles = [];
        this.coinImage = new Image();
        this.coinImage.src = 'images/coin.png'; // 假设有这个图片，如果没有可以改用文字或其他方式展示
        
        // 在没有图片的情况下备用
        this.coinImageLoaded = false;
        this.coinImage.onload = () => {
            this.coinImageLoaded = true;
        };
    }
    
    update() {
        // 更新金币粒子效果
        this.coinParticles = this.coinParticles.filter(particle => {
            particle.update();
            return particle.alpha > 0;
        });
    }
    
    draw(ctx) {
        // 绘制金币UI
        ctx.save();
        
        // UI 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.roundRect(canvas.width - 110, 10, 100, 30, 5);
        ctx.fill();
        
        // 金币图标和数量
        if (this.coinImageLoaded) {
            ctx.drawImage(this.coinImage, canvas.width - 105, 15, 20, 20);
        } else {
            ctx.fillStyle = 'gold';
            ctx.font = '16px Arial';
            ctx.fillText('💰', canvas.width - 105, 28);
        }
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Orbitron';
        ctx.textAlign = 'right';
        ctx.fillText(this.coins.toString(), canvas.width - 20, 28);
        
        // 绘制金币粒子
        this.coinParticles.forEach(particle => particle.draw(ctx));
        
        ctx.restore();
    }
    
    addCoins(amount, x, y) {
        this.coins += amount;
        this.totalCoins += amount;
        localStorage.setItem('totalCoins', this.totalCoins);
        
        // 创建金币粒子效果
        for (let i = 0; i < Math.min(amount, 10); i++) {
            this.coinParticles.push(new CoinParticle(x, y));
        }
        
        // 播放金币音效
        resources.sounds.coin.currentTime = 0;
        resources.sounds.coin.play();
        
        // 添加飘动的数字
        game.floatingScores.push(new FloatingText(x, y, `+${amount} 金币`, 'gold'));
    }
    
    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }
}

// 金币粒子效果
class CoinParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 10 + Math.random() * 5;
        this.speedX = (Math.random() - 0.5) * 5;
        this.speedY = -Math.random() * 10 - 5;
        this.gravity = 0.3;
        this.alpha = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.alpha -= 0.01;
        this.rotation += this.rotationSpeed;
        
        if (this.y > canvas.height) {
            this.alpha = 0;
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 金币效果
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFC107';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 金币反光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-this.size / 5, -this.size / 5, this.size / 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 成就系统增强
class AchievementSystem {
    constructor() {
        this.achievements = [
            { id: 'firstFlight', name: '初次飞行', description: '完成第一次游戏', unlocked: false, icon: '✈️' },
            { id: 'coinCollector', name: '收藏家', description: '收集100枚金币', progress: 0, target: 100, unlocked: false, icon: '💰' },
            { id: 'sharpShooter', name: '神射手', description: '击落100架敌机', progress: 0, target: 100, unlocked: false, icon: '🎯' },
            { id: 'survivalKing', name: '生存大师', description: '在一局游戏中存活2分钟', progress: 0, target: 120, unlocked: false, icon: '⏱️' },
            { id: 'comboMaster', name: '连击大师', description: '达成20连击', progress: 0, target: 20, unlocked: false, icon: '🔥' },
            { id: 'powerCollector', name: '神兽收集者', description: '收集全部10种神兽', progress: 0, target: 10, unlocked: false, icon: '🐉' },
            { id: 'scoreChaser', name: '分数追逐者', description: '达到10000分', progress: 0, target: 10000, unlocked: false, icon: '📈' }
        ];
        
        // 从本地存储加载进度
        this.loadProgress();
    }
    
    loadProgress() {
        const savedAchievements = localStorage.getItem('achievements');
        if (savedAchievements) {
            const parsed = JSON.parse(savedAchievements);
            this.achievements.forEach((achievement, index) => {
                if (parsed[achievement.id]) {
                    this.achievements[index] = {...achievement, ...parsed[achievement.id]};
                }
            });
        }
    }
    
    saveProgress() {
        const toSave = {};
        this.achievements.forEach(achievement => {
            toSave[achievement.id] = {
                progress: achievement.progress || 0,
                unlocked: achievement.unlocked
            };
        });
        localStorage.setItem('achievements', JSON.stringify(toSave));
    }
    
    updateProgress(id, value) {
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.progress = value;
            if (achievement.progress >= achievement.target) {
                this.unlockAchievement(id);
            }
            this.saveProgress();
        }
    }
    
    incrementProgress(id, amount = 1) {
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.progress = (achievement.progress || 0) + amount;
            if (achievement.progress >= achievement.target) {
                this.unlockAchievement(id);
            }
            this.saveProgress();
        }
    }
    
    unlockAchievement(id) {
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            
            // 显示成就通知
            game.addMessage(`🏆 成就解锁：${achievement.name}`, 'achievement');
            
            // 播放成就音效
            resources.sounds.achievement.currentTime = 0;
            resources.sounds.achievement.play();
            
            // 给予金币奖励
            game.coinSystem.addCoins(50, game.player.x + game.player.width/2, game.player.y);
            
            this.saveProgress();
        }
    }
    
    drawAchievementNotification(ctx, achievement, y) {
        ctx.save();
        
        // 通知背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.roundRect(canvas.width/2 - 150, y, 300, 60, 10);
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 2;
        ctx.roundRect(canvas.width/2 - 150, y, 300, 60, 10);
        ctx.stroke();
        
        // 图标
        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(achievement.icon, canvas.width/2 - 135, y + 25);
        
        // 标题
        ctx.font = 'bold 16px Orbitron';
        ctx.fillStyle = 'gold';
        ctx.fillText(achievement.name, canvas.width/2 - 100, y + 25);
        
        // 描述
        ctx.font = '12px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(achievement.description, canvas.width/2 - 100, y + 45);
        
        ctx.restore();
    }
}

// 浮动文本效果
class FloatingText {
    constructor(x, y, text, color = 'white', size = 20) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.alpha = 1;
        this.velocity = -2;
    }
    
    update() {
        this.y += this.velocity;
        this.alpha -= 0.02;
        return this.alpha > 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = `bold ${this.size}px Orbitron`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// 每日奖励系统
class DailyRewardSystem {
    constructor() {
        this.lastClaimDate = localStorage.getItem('lastDailyReward') || null;
        this.streak = parseInt(localStorage.getItem('dailyStreak')) || 0;
        this.maxStreak = parseInt(localStorage.getItem('maxDailyStreak')) || 0;
        this.rewards = [
            { day: 1, coins: 50, extraLife: false },
            { day: 2, coins: 100, extraLife: false },
            { day: 3, coins: 150, extraLife: false },
            { day: 4, coins: 200, extraLife: false },
            { day: 5, coins: 250, extraLife: false },
            { day: 6, coins: 300, extraLife: false },
            { day: 7, coins: 500, extraLife: true }
        ];
    }
    
    canClaimToday() {
        if (!this.lastClaimDate) return true;
        
        const now = new Date();
        const last = new Date(this.lastClaimDate);
        
        // 检查是否是不同的日期
        return now.toDateString() !== last.toDateString();
    }
    
    claimDailyReward() {
        const now = new Date();
        const last = this.lastClaimDate ? new Date(this.lastClaimDate) : null;
        
        // 检查是否连续签到
        if (last) {
            const dayDiff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
            if (dayDiff <= 1) {
                // 连续签到
                this.streak++;
            } else {
                // 中断连续签到
                this.streak = 1;
            }
        } else {
            this.streak = 1;
        }
        
        // 更新最大连续签到
        if (this.streak > this.maxStreak) {
            this.maxStreak = this.streak;
            localStorage.setItem('maxDailyStreak', this.maxStreak);
        }
        
        // 获取当天的奖励
        const rewardIndex = (this.streak - 1) % 7;
        const reward = this.rewards[rewardIndex];
        
        // 给予奖励
        game.coinSystem.addCoins(reward.coins, canvas.width/2, canvas.height/2);
        if (reward.extraLife) {
            game.lives = Math.min(game.lives + 1, 5);
            game.addMessage("🎁 每日奖励：额外生命！", 'achievement');
        }
        
        // 保存签到数据
        this.lastClaimDate = now.toString();
        localStorage.setItem('lastDailyReward', this.lastClaimDate);
        localStorage.setItem('dailyStreak', this.streak);
        
        return reward;
    }
    
    getRemainingTimeText() {
        if (!this.lastClaimDate) return "立即领取";
        
        const now = new Date();
        const last = new Date(this.lastClaimDate);
        const tomorrow = new Date(last);
        tomorrow.setDate(last.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        
        if (diff <= 0) return "立即领取";
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}小时${minutes}分钟后可领取`;
    }
}

// 任务系统
class MissionSystem {
    constructor() {
        this.missions = [
            { id: 'killEnemies', name: '击落敌机', description: '击落10架敌机', progress: 0, target: 10, reward: 50, completed: false },
            { id: 'collectCoins', name: '收集金币', description: '收集20枚金币', progress: 0, target: 20, reward: 40, completed: false },
            { id: 'surviveTime', name: '生存挑战', description: '存活60秒', progress: 0, target: 60, reward: 60, completed: false },
            { id: 'collectPowerups', name: '神兽收集', description: '收集3个神兽能力', progress: 0, target: 3, reward: 70, completed: false },
            { id: 'reachScore', name: '分数挑战', description: '达到1000分', progress: 0, target: 1000, reward: 80, completed: false }
        ];
        
        // 每日刷新时间
        this.lastRefreshDate = localStorage.getItem('missionRefreshDate') || null;
        
        // 从本地存储加载进度
        this.loadProgress();
        
        // 检查是否需要刷新任务
        this.checkRefresh();
    }
    
    loadProgress() {
        const savedMissions = localStorage.getItem('missions');
        if (savedMissions) {
            const parsed = JSON.parse(savedMissions);
            this.missions.forEach((mission, index) => {
                if (parsed[mission.id]) {
                    this.missions[index] = {...mission, ...parsed[mission.id]};
                }
            });
        }
    }
    
    saveProgress() {
        const toSave = {};
        this.missions.forEach(mission => {
            toSave[mission.id] = {
                progress: mission.progress,
                completed: mission.completed
            };
        });
        localStorage.setItem('missions', JSON.stringify(toSave));
        localStorage.setItem('missionRefreshDate', this.lastRefreshDate);
    }
    
    checkRefresh() {
        const now = new Date();
        const last = this.lastRefreshDate ? new Date(this.lastRefreshDate) : null;
        
        // 检查是否需要刷新任务（每天刷新）
        if (!last || now.toDateString() !== last.toDateString()) {
            this.refreshMissions();
            this.lastRefreshDate = now.toString();
            this.saveProgress();
        }
    }
    
    refreshMissions() {
        this.missions.forEach(mission => {
            mission.progress = 0;
            mission.completed = false;
            // 随机生成新的目标数值和奖励
            mission.target = Math.floor(mission.target * (0.8 + Math.random() * 0.4));
            mission.reward = Math.floor(mission.reward * (0.8 + Math.random() * 0.4));
        });
    }
    
    updateProgress(id, value) {
        const mission = this.missions.find(m => m.id === id);
        if (mission && !mission.completed) {
            mission.progress = value;
            if (mission.progress >= mission.target) {
                this.completeMission(id);
            }
            this.saveProgress();
        }
    }
    
    incrementProgress(id, amount = 1) {
        const mission = this.missions.find(m => m.id === id);
        if (mission && !mission.completed) {
            mission.progress += amount;
            if (mission.progress >= mission.target) {
                this.completeMission(id);
            }
            this.saveProgress();
        }
    }
    
    completeMission(id) {
        const mission = this.missions.find(m => m.id === id);
        if (mission && !mission.completed) {
            mission.completed = true;
            
            // 显示完成通知
            game.addMessage(`🎯 任务完成：${mission.name}，奖励${mission.reward}金币！`, 'achievement');
            
            // 给予金币奖励
            game.coinSystem.addCoins(mission.reward, game.player.x + game.player.width/2, game.player.y);
            
            this.saveProgress();
        }
    }
}

// 连击系统增强
class ComboSystem {
    constructor() {
        this.combo = 0;
        this.maxCombo = 0;
        this.comboTimer = 0;
        this.comboTimeout = 2000; // 2秒内需要继续击中敌人
        this.comboMultiplier = 1;
        this.comboText = '';
        this.comboTextAlpha = 0;
    }
    
    addCombo() {
        this.combo++;
        this.comboTimer = Date.now() + this.comboTimeout;
        
        // 更新最大连击
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
            // 检查连击成就
            if (game.achievementSystem) {
                game.achievementSystem.updateProgress('comboMaster', this.maxCombo);
            }
        }
        
        // 根据连击值确定倍率
        if (this.combo >= 50) {
            this.comboMultiplier = 3;
            this.comboText = 'UNSTOPPABLE!';
        } else if (this.combo >= 30) {
            this.comboMultiplier = 2.5;
            this.comboText = 'GODLIKE!';
        } else if (this.combo >= 20) {
            this.comboMultiplier = 2;
            this.comboText = 'DOMINATING!';
        } else if (this.combo >= 10) {
            this.comboMultiplier = 1.5;
            this.comboText = 'IMPRESSIVE!';
        } else if (this.combo >= 5) {
            this.comboMultiplier = 1.2;
            this.comboText = 'NICE!';
        } else {
            this.comboMultiplier = 1;
            this.comboText = '';
        }
        
        // 显示连击文本
        if (this.combo >= 5) {
            this.comboTextAlpha = 1;
            // 播放连击音效
            if (this.combo % 5 === 0) {
                resources.sounds.combo.currentTime = 0;
                resources.sounds.combo.play();
            }
        }
        
        // 任务进度更新
        if (game.missionSystem) {
            game.missionSystem.updateProgress('reachCombo', this.combo);
        }
    }
    
    resetCombo() {
        if (this.combo >= 5) {
            game.addMessage(`连击中断！最高${this.combo}连击！`, 'normal');
        }
        this.combo = 0;
        this.comboMultiplier = 1;
        this.comboText = '';
    }
    
    update() {
        // 检查连击是否超时
        if (this.combo > 0 && Date.now() > this.comboTimer) {
            this.resetCombo();
        }
        
        // 更新连击文本透明度
        if (this.comboTextAlpha > 0) {
            this.comboTextAlpha -= 0.01;
        }
    }
    
    draw(ctx) {
        if (this.combo >= 5) {
            ctx.save();
            
            // 绘制连击数
            ctx.font = 'bold 24px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, this.comboTextAlpha + 0.2)})`;
            ctx.fillText(`${this.combo} COMBO`, canvas.width/2, 50);
            
            // 绘制连击文本
            if (this.comboText && this.comboTextAlpha > 0) {
                ctx.font = 'bold 32px Orbitron';
                ctx.fillStyle = `rgba(255, ${255 - this.combo * 2}, 0, ${this.comboTextAlpha})`;
                ctx.fillText(this.comboText, canvas.width/2, 90);
            }
            
            // 绘制连击条
            const barWidth = 200;
            const remainingTime = Math.max(0, this.comboTimer - Date.now()) / this.comboTimeout;
            const currentBarWidth = barWidth * remainingTime;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.roundRect(canvas.width/2 - barWidth/2, 60, barWidth, 10, 5);
            ctx.fill();
            
            const gradient = ctx.createLinearGradient(canvas.width/2 - barWidth/2, 0, canvas.width/2 + barWidth/2, 0);
            gradient.addColorStop(0, '#ff0000');
            gradient.addColorStop(0.5, '#ffff00');
            gradient.addColorStop(1, '#00ff00');
            
            ctx.fillStyle = gradient;
            ctx.roundRect(canvas.width/2 - barWidth/2, 60, currentBarWidth, 10, 5);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    getScoreMultiplier() {
        return this.comboMultiplier;
    }
}

// 将这些系统导出以便在主游戏中使用
window.RewardSystems = {
    CoinSystem,
    AchievementSystem,
    FloatingText,
    DailyRewardSystem,
    MissionSystem,
    ComboSystem
}; 