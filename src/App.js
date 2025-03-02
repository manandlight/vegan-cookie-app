import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import _ from 'lodash';

// アミノ酸基準値（mg/g protein） - FAO/WHO 2007基準
const aminoAcidReference = {
  isoleucine: 30,  // イソロイシン
  leucine: 61,     // ロイシン
  lysine: 48,      // リシン（リジン）
  methionine_cystine: 23, // 含硫アミノ酸合計（メチオニン+シスチン）
  phenylalanine_tyrosine: 41, // 芳香族アミノ酸合計（フェニルアラニン+チロシン）
  threonine: 25,   // トレオニン（スレオニン）
  tryptophan: 6.6, // トリプトファン
  valine: 40,      // バリン
  histidine: 16,   // ヒスチジン
};

// 材料カテゴリーのデータ
const ingredientCategories = [
  {
    name: "穀物・粉",
    items: [
      { id: "oatmeal", name: "オートミール", price: 348/330, gi: 55 },
      { id: "oatmeal_flour", name: "オートミール粉", price: 348/330, gi: 55 },
      { id: "rice_flour", name: "米粉", price: 500/1000, gi: 85 },
      { id: "kinako", name: "きな粉（黄大豆・脱皮）", price: 691/370, gi: 25 },
      { id: "chickpea_flour", name: "ひよこ豆粉（ベサン粉）", price: 1495/500, gi: 35 },
      { id: "almond_powder", name: "アーモンドプードル", price: 1200/500, gi: 15 },
      { id: "soy_meat", name: "乾燥大豆ミート", price: 2330/1000, gi: 15 }
    ]
  },
  {
    name: "ナッツ・種子",
    items: [
      { id: "almond", name: "アーモンド", price: 900/460, gi: 15 },
      { id: "cashew", name: "カシューナッツ", price: 548/205, gi: 25 },
      { id: "walnut", name: "クルミ", price: 298/95, gi: 15 },
      { id: "sesame", name: "胡麻", price: 318/50, gi: 35 },
      { id: "quinoa", name: "キヌア", price: 1576/1000, gi: 35 },
      { id: "chia_seed", name: "チアシード", price: 2500/1000, gi: 1 }
    ]
  },
  {
    name: "スパイス・風味",
    items: [
      { id: "cocoa", name: "ココアパウダー", price: 1980/300, gi: 20 },
      { id: "ginger", name: "ジンジャーパウダー", price: 750/100, gi: 15 },
      { id: "cinnamon", name: "シナモン", price: 1236/250, gi: 5 },
      { id: "cardamom", name: "カルダモン", price: 1660/100, gi: 5 }
    ]
  },
  {
    name: "甘味",
    items: [
      { id: "sugar_beet", name: "甜菜糖", price: 450/600, gi: 65 },
      { id: "maple_syrup", name: "メープルシロップ", price: 1200/330, gi: 55 },
      { id: "date_syrup", name: "デーツシロップ", price: 945/400, gi: 50 },
      { id: "dates", name: "デーツ", price: 298/135, gi: 50 },
      { id: "raisins", name: "レーズン", price: 358/300, gi: 65 },
      { id: "banana", name: "バナナ", price: 200/300, gi: 60 }
    ]
  },
  {
    name: "液体",
    items: [
      { id: "coconut_oil", name: "ココナッツオイル", price: 1000/460, gi: 0 },
      { id: "soy_milk", name: "豆乳", price: 208/1000, gi: 30 }
    ]
  }
];

// プリセットレシピ
const presetRecipes = [
  {
    id: "simple",
    name: "シンプル",
    gi: 42,
    ingredients: [
      { id: "oatmeal", name: "オートミール", amount: 50 },
      { id: "rice_flour", name: "米粉", amount: 30 },
      { id: "kinako", name: "きな粉（黄大豆・脱皮）", amount: 30 },
      { id: "cashew", name: "カシューナッツ", amount: 30 },
      { id: "sugar_beet", name: "甜菜糖", amount: 40 },
      { id: "cinnamon", name: "シナモン", amount: 3 },
      { id: "cardamom", name: "カルダモン", amount: 1.5 },
      { id: "coconut_oil", name: "ココナッツオイル", amount: 20 },
      { id: "soy_milk", name: "豆乳", amount: 80 }
    ]
  },
  {
    id: "cranky",
    name: "クランキーハイプロテイン",
    gi: 38,
    ingredients: [
      { id: "oatmeal", name: "オートミール", amount: 20 },
      { id: "oatmeal_flour", name: "オートミール粉", amount: 30 },
      { id: "rice_flour", name: "米粉", amount: 30 },
      { id: "soy_meat", name: "乾燥大豆ミート", amount: 50 },
      { id: "cashew", name: "カシューナッツ", amount: 15 },
      { id: "quinoa", name: "キヌア", amount: 25 },
      { id: "chia_seed", name: "チアシード", amount: 12 },
      { id: "cinnamon", name: "シナモン", amount: 3 },
      { id: "cardamom", name: "カルダモン", amount: 1.5 },
      { id: "coconut_oil", name: "ココナッツオイル", amount: 20 },
      { id: "maple_syrup", name: "メープルシロップ", amount: 60 }
    ]
  },
  {
    id: "cocoa",
    name: "ココアハイプロテイン",
    gi: 30,
    ingredients: [
      { id: "oatmeal_flour", name: "オートミール粉", amount: 50 },
      { id: "rice_flour", name: "米粉", amount: 30 },
      { id: "soy_meat", name: "乾燥大豆ミート", amount: 40 },
      { id: "almond", name: "アーモンド", amount: 30 },
      { id: "cashew", name: "カシューナッツ", amount: 15 },
      { id: "cocoa", name: "ココアパウダー", amount: 20 },
      { id: "cinnamon", name: "シナモン", amount: 3 },
      { id: "date_syrup", name: "デーツシロップ", amount: 30 },
      { id: "coconut_oil", name: "ココナッツオイル", amount: 20 },
      { id: "soy_milk", name: "豆乳", amount: 30 }
    ]
  },
  {
    id: "banana",
    name: "バナナジンジャー",
    gi: 45,
    ingredients: [
      { id: "oatmeal_flour", name: "オートミール粉", amount: 70 },
      { id: "soy_meat", name: "乾燥大豆ミート", amount: 40 },
      { id: "almond", name: "アーモンド", amount: 30 },
      { id: "cashew", name: "カシューナッツ", amount: 15 },
      { id: "ginger", name: "ジンジャーパウダー", amount: 5 },
      { id: "cinnamon", name: "シナモン", amount: 3 },
      { id: "banana", name: "バナナ", amount: 120 },
      { id: "coconut_oil", name: "ココナッツオイル", amount: 25 },
      { id: "soy_milk", name: "豆乳", amount: 30 }
    ]
  },
  {
    id: "soymeat",
    name: "ソイミートココア",
    gi: 25,
    ingredients: [
      { id: "chickpea_flour", name: "ひよこ豆粉（ベサン粉）", amount: 40 },
      { id: "soy_meat", name: "乾燥大豆ミート", amount: 70 },
      { id: "almond", name: "アーモンド", amount: 30 },
      { id: "cashew", name: "カシューナッツ", amount: 15 },
      { id: "cocoa", name: "ココアパウダー", amount: 20 },
      { id: "date_syrup", name: "デーツシロップ", amount: 40 },
      { id: "coconut_oil", name: "ココナッツオイル", amount: 20 },
      { id: "soy_milk", name: "豆乳", amount: 30 }
    ]
  }
];

// モック用の栄養データベース
const nutritionDatabase = {
  oatmeal: {
    calories: 350,
    protein: 13.7,
    fat: 5.7,
    carbs: 61.8,
    aminoAcids: {
      isoleucine: 590,
      leucine: 1100,
      lysine: 620,
      methionine: 270,
      cystine: 500,
      phenylalanine: 760,
      tyrosine: 490, 
      threonine: 500,
      tryptophan: 200,
      valine: 800,
      histidine: 350
    }
  },
  oatmeal_flour: {
    calories: 350,
    protein: 13.7,
    fat: 5.7,
    carbs: 61.8,
    aminoAcids: {
      isoleucine: 590,
      leucine: 1100,
      lysine: 620,
      methionine: 270,
      cystine: 500,
      phenylalanine: 760,
      tyrosine: 490, 
      threonine: 500,
      tryptophan: 200,
      valine: 800,
      histidine: 350
    }
  },
  rice_flour: {
    calories: 370,
    protein: 7.1,
    fat: 2.9,
    carbs: 82.6,
    aminoAcids: {
      isoleucine: 270,
      leucine: 560,
      lysine: 140,
      methionine: 160,
      cystine: 57,
      phenylalanine: 360,
      tyrosine: 290,
      threonine: 220,
      tryptophan: 96,
      valine: 420,
      histidine: 190
    }
  },
  kinako: {
    calories: 424,
    protein: 37.0,
    fat: 22.8,
    carbs: 29.3,
    aminoAcids: {
      isoleucine: 1900,
      leucine: 3100,
      lysine: 2500,
      methionine: 570,
      cystine: 650,
      phenylalanine: 2100,
      tyrosine: 1400,
      threonine: 1700,
      tryptophan: 530,
      valine: 2000,
      histidine: 1100
    }
  },
  chickpea_flour: {
    calories: 390,
    protein: 22.4,
    fat: 6.9,
    carbs: 58.3,
    aminoAcids: {
      isoleucine: 860,
      leucine: 1450,
      lysine: 1370,
      methionine: 290,
      cystine: 290,
      phenylalanine: 1120,
      tyrosine: 560,
      threonine: 740,
      tryptophan: 190,
      valine: 880,
      histidine: 580
    }
  },
  almond_powder: {
    calories: 609,
    protein: 19.6,
    fat: 51.8,
    carbs: 11.5,
    aminoAcids: {
      isoleucine: 870,
      leucine: 1500,
      lysine: 660,
      methionine: 190,
      cystine: 320,
      phenylalanine: 1000,
      tyrosine: 630,
      threonine: 650,
      tryptophan: 210,
      valine: 1000,
      histidine: 560
    }
  },
  soy_meat: {
    calories: 350,
    protein: 50.0,
    fat: 1.5,
    carbs: 37.0,
    aminoAcids: {
      isoleucine: 2200,
      leucine: 3800,
      lysine: 3000,
      methionine: 650,
      cystine: 750,
      phenylalanine: 2500,
      tyrosine: 1800,
      threonine: 1900,
      tryptophan: 650,
      valine: 2400,
      histidine: 1300
    }
  },
  almond: {
    calories: 609,
    protein: 19.6,
    fat: 51.8,
    carbs: 11.5,
    aminoAcids: {
      isoleucine: 870,
      leucine: 1500,
      lysine: 660,
      methionine: 190,
      cystine: 320,
      phenylalanine: 1000,
      tyrosine: 630,
      threonine: 650,
      tryptophan: 210,
      valine: 1000,
      histidine: 560
    }
  },
  cashew: {
    calories: 591,
    protein: 19.8,
    fat: 47.6,
    carbs: 20.2,
    aminoAcids: {
      isoleucine: 960,
      leucine: 1700,
      lysine: 1100,
      methionine: 420,
      cystine: 500,
      phenylalanine: 1000,
      tyrosine: 710,
      threonine: 830,
      tryptophan: 370,
      valine: 1300,
      histidine: 540
    }
  },
  walnut: {
    calories: 650,
    protein: 15.0,
    fat: 65.0,
    carbs: 14.0,
    aminoAcids: {
      isoleucine: 750,
      leucine: 1300,
      lysine: 450,
      methionine: 250,
      cystine: 300,
      phenylalanine: 800,
      tyrosine: 550,
      threonine: 600,
      tryptophan: 190,
      valine: 850,
      histidine: 500
    }
  },
  sesame: {
    calories: 590,
    protein: 18.2,
    fat: 53.0,
    carbs: 15.0,
    aminoAcids: {
      isoleucine: 830,
      leucine: 1450,
      lysine: 580,
      methionine: 700,
      cystine: 380,
      phenylalanine: 1000,
      tyrosine: 800,
      threonine: 770,
      tryptophan: 320,
      valine: 1000,
      histidine: 530
    }
  },
  quinoa: {
    calories: 344,
    protein: 13.4,
    fat: 3.2,
    carbs: 67.1,
    aminoAcids: {
      isoleucine: 480,
      leucine: 810,
      lysine: 720,
      methionine: 260,
      cystine: 210,
      phenylalanine: 510,
      tyrosine: 380,
      threonine: 500,
      tryptophan: 170,
      valine: 590,
      histidine: 380
    }
  },
  chia_seed: {
    calories: 446,
    protein: 19.4,
    fat: 33.9,
    carbs: 34.5,
    aminoAcids: {
      isoleucine: 790,
      leucine: 1400,
      lysine: 1000,
      methionine: 640,
      cystine: 470,
      phenylalanine: 1100,
      tyrosine: 710,
      threonine: 830,
      tryptophan: 290,
      valine: 1000,
      histidine: 620
    }
  },
  cocoa: {
    calories: 350,
    protein: 18.0,
    fat: 20.0,
    carbs: 30.0,
    aminoAcids: {
      isoleucine: 870,
      leucine: 1450,
      lysine: 1150,
      methionine: 430,
      cystine: 390,
      phenylalanine: 1100,
      tyrosine: 800,
      threonine: 900,
      tryptophan: 350,
      valine: 1200,
      histidine: 500
    }
  },
  ginger: {
    calories: 330,
    protein: 8.8,
    fat: 4.2,
    carbs: 70.0,
    aminoAcids: {
      isoleucine: 400,
      leucine: 700,
      lysine: 500,
      methionine: 150,
      cystine: 140,
      phenylalanine: 450,
      tyrosine: 350,
      threonine: 380,
      tryptophan: 120,
      valine: 450,
      histidine: 210
    }
  },
  cinnamon: {
    calories: 250,
    protein: 3.9,
    fat: 1.2,
    carbs: 80.0,
    aminoAcids: {
      isoleucine: 170,
      leucine: 300,
      lysine: 220,
      methionine: 80,
      cystine: 60,
      phenylalanine: 170,
      tyrosine: 120,
      threonine: 160,
      tryptophan: 50,
      valine: 200,
      histidine: 90
    }
  },
  cardamom: {
    calories: 300,
    protein: 10.8,
    fat: 6.7,
    carbs: 68.5,
    aminoAcids: {
      isoleucine: 450,
      leucine: 750,
      lysine: 580,
      methionine: 180,
      cystine: 150,
      phenylalanine: 400,
      tyrosine: 300,
      threonine: 420,
      tryptophan: 140,
      valine: 520,
      histidine: 250
    }
  },
  sugar_beet: {
    calories: 394,
    protein: 0.0,
    fat: 0.0,
    carbs: 99.0,
    aminoAcids: {
      isoleucine: 0,
      leucine: 0,
      lysine: 0,
      methionine: 0,
      cystine: 0,
      phenylalanine: 0,
      tyrosine: 0,
      threonine: 0,
      tryptophan: 0,
      valine: 0,
      histidine: 0
    }
  },
  maple_syrup: {
    calories: 260,
    protein: 0.0,
    fat: 0.0,
    carbs: 67.0,
    aminoAcids: {
      isoleucine: 0,
      leucine: 0,
      lysine: 0,
      methionine: 0,
      cystine: 0,
      phenylalanine: 0,
      tyrosine: 0,
      threonine: 0,
      tryptophan: 0,
      valine: 0,
      histidine: 0
    }
  },
  date_syrup: {
    calories: 300,
    protein: 2.0,
    fat: 0.0,
    carbs: 75.0,
    aminoAcids: {
      isoleucine: 80,
      leucine: 140,
      lysine: 110,
      methionine: 30,
      cystine: 40,
      phenylalanine: 90,
      tyrosine: 60,
      threonine: 80,
      tryptophan: 30,
      valine: 110,
      histidine: 50
    }
  },
  dates: {
    calories: 280,
    protein: 2.5,
    fat: 0.4,
    carbs: 74.0,
    aminoAcids: {
      isoleucine: 100,
      leucine: 170,
      lysine: 140,
      methionine: 40,
      cystine: 50,
      phenylalanine: 110,
      tyrosine: 70,
      threonine: 100,
      tryptophan: 40,
      valine: 130,
      histidine: 60
    }
  },
  raisins: {
    calories: 300,
    protein: 3.1,
    fat: 0.5,
    carbs: 79.0,
    aminoAcids: {
      isoleucine: 110,
      leucine: 190,
      lysine: 150,
      methionine: 50,
      cystine: 60,
      phenylalanine: 120,
      tyrosine: 80,
      threonine: 130,
      tryptophan: 50,
      valine: 160,
      histidine: 70
    }
  },
  banana: {
    calories: 90,
    protein: 1.1,
    fat: 0.3,
    carbs: 22.0,
    aminoAcids: {
      isoleucine: 50,
      leucine: 80,
      lysine: 60,
      methionine: 20,
      cystine: 30,
      phenylalanine: 50,
      tyrosine: 30,
      threonine: 40,
      tryptophan: 10,
      valine: 60,
      histidine: 30
    }
  },
  coconut_oil: {
    calories: 900,
    protein: 0.0,
    fat: 100.0,
    carbs: 0.0,
    aminoAcids: {
      isoleucine: 0,
      leucine: 0,
      lysine: 0,
      methionine: 0,
      cystine: 0,
      phenylalanine: 0,
      tyrosine: 0,
      threonine: 0,
      tryptophan: 0,
      valine: 0,
      histidine: 0
    }
  },
  soy_milk: {
    calories: 50,
    protein: 3.5,
    fat: 2.0,
    carbs: 2.5,
    aminoAcids: {
      isoleucine: 150,
      leucine: 250,
      lysine: 200,
      methionine: 40,
      cystine: 50,
      phenylalanine: 170,
      tyrosine: 120,
      threonine: 130,
      tryptophan: 40,
      valine: 160,
      histidine: 80
    }
  }
};

// 日本食品標準成分表から栄養データをロードする関数
const loadNutritionData = async () => {
  // ハードコードされたデータを使用
  console.log("ハードコードされた栄養データを使用します");
  return nutritionDatabase;
};

// アミノ酸スコアを計算する関数
const calculateAminoAcidScore = (ingredients, nutritionData) => {
  const totalProtein = ingredients.reduce((sum, ingredient) => {
    const nutrition = nutritionData[ingredient.id];
    if (!nutrition) return sum;
    return sum + (nutrition.protein * ingredient.amount / 100);
  }, 0);
  
  if (totalProtein === 0) return 0;
  
  // 各必須アミノ酸の合計量を計算
  const totalAminoAcids = {};
  
  Object.keys(aminoAcidReference).forEach(aa => {
    let total = 0;
    
    ingredients.forEach(ingredient => {
      const nutrition = nutritionData[ingredient.id];
      if (!nutrition || !nutrition.aminoAcids) return;
      
      if (aa === 'methionine_cystine') {
        total += ((nutrition.aminoAcids.methionine || 0) + (nutrition.aminoAcids.cystine || 0)) * ingredient.amount / 100;
      } else if (aa === 'phenylalanine_tyrosine') {
        total += ((nutrition.aminoAcids.phenylalanine || 0) + (nutrition.aminoAcids.tyrosine || 0)) * ingredient.amount / 100;
      } else {
        total += (nutrition.aminoAcids[aa] || 0) * ingredient.amount / 100;
      }
    });
    
    totalAminoAcids[aa] = total;
  });
  
  // 各アミノ酸のスコアを計算
  const scores = {};
  Object.keys(aminoAcidReference).forEach(aa => {
    const referenceValue = aminoAcidReference[aa] * totalProtein;
    scores[aa] = totalAminoAcids[aa] > 0 ? (totalAminoAcids[aa] / referenceValue) * 100 : 0;
  });
  
  // 最小値（制限アミノ酸）がアミノ酸スコア
  const aminoAcidScore = Math.min(...Object.values(scores));
  
  return {
    totalScore: aminoAcidScore,
    individualScores: scores,
    limitingAminoAcid: Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b)
  };
};

// 栄養情報を計算する関数
const calculateNutrition = (ingredients, nutritionData) => {
  const totalWeight = ingredients.reduce((sum, ingredient) => sum + ingredient.amount, 0);
  
  // カロリー、タンパク質、脂質、炭水化物の合計を計算
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalPrice = 0;
  
  console.log("栄養計算の詳細:");
  ingredients.forEach(ingredient => {
    const data = nutritionData[ingredient.id];
    if (!data) {
      console.log(`${ingredient.name}: データなし`);
      return;
    }
    
    const ratio = ingredient.amount / 100; // 100gあたりの値を調整
    const ingredientCalories = data.calories * ratio;
    
    console.log(`${ingredient.name} (${ingredient.amount}g): ${data.calories} kcal/100g × ${ratio} = ${ingredientCalories.toFixed(1)} kcal`);
    
    totalCalories += ingredientCalories;
    totalProtein += data.protein * ratio;
    totalFat += data.fat * ratio;
    totalCarbs += data.carbs * ratio;
    
    // 価格を計算
    const categoryItem = ingredientCategories
      .flatMap(cat => cat.items)
      .find(item => item.id === ingredient.id);
    
    if (categoryItem) {
      totalPrice += categoryItem.price * ingredient.amount;
    }
  });
  
  console.log(`総カロリー: ${totalCalories.toFixed(1)} kcal`);
  
  // GI値を計算（炭水化物量による重み付け平均）
  let weightedGI = 0;
  let totalCarbsForGI = 0;
  
  ingredients.forEach(ingredient => {
    const data = nutritionData[ingredient.id];
    if (!data) return;
    
    const categoryItem = ingredientCategories
      .flatMap(cat => cat.items)
      .find(item => item.id === ingredient.id);
    
    if (categoryItem && data.carbs > 0) {
      const carbsInIngredient = data.carbs * ingredient.amount / 100;
      weightedGI += categoryItem.gi * carbsInIngredient;
      totalCarbsForGI += carbsInIngredient;
    }
  });
  
  const gi = totalCarbsForGI > 0 ? Math.round(weightedGI / totalCarbsForGI) : 0;
  
  // アミノ酸スコアを計算
  const aminoAcidScoreData = calculateAminoAcidScore(ingredients, nutritionData);
  
  return {
    totalWeight,
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    price: Math.round(totalPrice),
    gi,
    aminoAcidScore: aminoAcidScoreData,
    perCookie: {
      weight: Math.round(totalWeight / 8),
      calories: Math.round(totalCalories / 8),
      protein: Math.round((totalProtein / 8) * 10) / 10,
      price: Math.round(totalPrice / 8)
    },
    pfcRatio: {
      protein: Math.round((totalProtein * 4 / totalCalories) * 100),
      fat: Math.round((totalFat * 9 / totalCalories) * 100),
      carbs: Math.round((totalCarbs * 4 / totalCalories) * 100)
    }
  };
};

// レコメンデーション計算関数
const calculateRecommendation = (ingredients, nutritionData, aminoAcidScore) => {
  if (aminoAcidScore.totalScore >= 100) return null;
  
  // 制限アミノ酸を特定
  const limitingAA = aminoAcidScore.limitingAminoAcid;
  
  // 各材料に対して、制限アミノ酸を補う効果を計算
  const recommendations = [];
  
  ingredientCategories.forEach(category => {
    category.items.forEach(item => {
      // 既に使用している材料は除外する
      if (ingredients.some(i => i.id === item.id)) return;
      
      const nutrition = nutritionData[item.id];
      if (!nutrition || !nutrition.aminoAcids) return;
      
      let aaContent = 0;
      if (limitingAA === 'methionine_cystine') {
        aaContent = (nutrition.aminoAcids.methionine || 0) + (nutrition.aminoAcids.cystine || 0);
      } else if (limitingAA === 'phenylalanine_tyrosine') {
        aaContent = (nutrition.aminoAcids.phenylalanine || 0) + (nutrition.aminoAcids.tyrosine || 0);
      } else {
        aaContent = nutrition.aminoAcids[limitingAA] || 0;
      }
      
      if (aaContent > 0) {
        recommendations.push({
          ...item,
          score: aaContent / nutrition.protein,
          aaContent
        });
      }
    });
  });
  
  // スコアでソート
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
};

// メインアプリケーションコンポーネント
const VeganCookieApp = () => {
  const [selectedCategory, setSelectedCategory] = useState("プリセット");
  const [ingredients, setIngredients] = useState([]);
  const [nutritionData, setNutritionData] = useState(nutritionDatabase);
  const [nutrition, setNutrition] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  
  // 初期ロード時に栄養データを取得
  useEffect(() => {
    const loadData = async () => {
      const data = await loadNutritionData();
      setNutritionData(data);
    };
    
    loadData();
  }, []);
  
  // 材料が変更された時に栄養計算を実行
  useEffect(() => {
    if (ingredients.length > 0) {
      const calculatedNutrition = calculateNutrition(ingredients, nutritionData);
      setNutrition(calculatedNutrition);
      
      // アミノ酸スコアが100%未満の場合はレコメンデーションを計算
      if (calculatedNutrition.aminoAcidScore.totalScore < 100) {
        const recs = calculateRecommendation(
          ingredients, 
          nutritionData, 
          calculatedNutrition.aminoAcidScore
        );
        setRecommendations(recs);
      } else {
        setRecommendations(null);
      }
    } else {
      setNutrition(null);
      setRecommendations(null);
    }
  }, [ingredients, nutritionData]);
  
  // 材料を削除する関数
  const removeIngredient = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };
  
  // 材料の量を変更する関数
  const changeAmount = (index, delta) => {
    const newIngredients = [...ingredients];
    newIngredients[index].amount = Math.max(0, newIngredients[index].amount + delta);
    setIngredients(newIngredients);
  };
  
  // 材料の量を直接入力して変更する関数
  const setAmount = (index, amount) => {
    const newIngredients = [...ingredients];
    newIngredients[index].amount = Math.max(0, parseFloat(amount) || 0);
    setIngredients(newIngredients);
  };
  
  // プリセットレシピを選択する関数
  const selectPresetRecipe = (recipeId) => {
    const recipe = presetRecipes.find(r => r.id === recipeId);
    if (recipe) {
      setIngredients([...recipe.ingredients]);
    }
  };
  
  // レコメンデーションを追加する関数
  const addRecommendation = (recommendation) => {
    setIngredients([
      ...ingredients,
      {
        id: recommendation.id,
        name: recommendation.name,
        amount: 0
      }
    ]);
  };
  
  // ドラッグ&ドロップ関連の関数
  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // 透明な画像をドラッグ画像に設定して、デフォルトのドラッグ画像を非表示にする
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null) return;
    
    // ドラッグ中のアイテムとドラッグオーバーされたアイテムが同じ場合は何もしない
    if (draggedItemIndex === index) return;
    
    // アイテムの順序を入れ替える
    const newIngredients = [...ingredients];
    const draggedItem = newIngredients[draggedItemIndex];
    newIngredients.splice(draggedItemIndex, 1);
    newIngredients.splice(index, 0, draggedItem);
    setIngredients(newIngredients);
    setDraggedItemIndex(index);
  };
  
  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* ヘッダーセクション */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">Vegan Cookie Recipe Maker for Yogi</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            ヨガの実践から生まれた強さと優しさを、あなたの日々に。このアプリで作るクッキーは、単なるお菓子ではなく、
            あなたの体と心を整えるためのエネルギー源。植物性の恵みだけで完全栄養を実現し、
            強度の高いヨガにも応える高タンパク質のレシピを、あなたの好みに合わせて作りましょう。
          </p>
        </div>
        
        {/* 材料選択セクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">材料を追加</h2>
            
            {/* カテゴリータブ */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedCategory("プリセット")}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === "プリセット"
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                プリセット
              </button>
              {ingredientCategories.map(category => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* 材料/プリセットリスト */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              {selectedCategory === "プリセット" ? (
                // プリセットレシピのリスト
                presetRecipes.map(recipe => (
                  <div key={recipe.id} className="p-2 rounded-md mb-1 transition-colors hover:bg-orange-50 bg-orange-50 border border-orange-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-orange-800">{recipe.name}</div>
                        <div className="text-xs text-orange-600">
                          GI値: {recipe.gi} | ¥{Math.round(recipe.ingredients.reduce((sum, ing) => {
                            const item = ingredientCategories.flatMap(cat => cat.items).find(i => i.id === ing.id);
                            return sum + (item ? item.price * ing.amount : 0);
                          }, 0))}
                        </div>
                      </div>
                      <button
                        onClick={() => selectPresetRecipe(recipe.id)}
                        className="bg-emerald-600 text-white px-2 py-1 rounded-md text-sm hover:bg-emerald-700"
                      >
                        選択
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // 通常の材料リスト
                ingredientCategories
                  .find(c => c.name === selectedCategory)?.items
                  .map(item => (
                    <div
                      key={item.id}
                      className="p-2 rounded-md mb-1 transition-colors hover:bg-gray-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            GI値: {item.gi} | ¥{Math.round(item.price * 100)}/100g
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const category = ingredientCategories.find(cat => 
                              cat.items.some(i => i.id === item.id)
                            );
                            
                            if (!category) return;
                            
                            setIngredients([
                              ...ingredients,
                              {
                                id: item.id,
                                name: item.name,
                                amount: 0
                              }
                            ]);
                          }}
                          className="bg-emerald-600 text-white px-2 py-1 rounded-md text-sm hover:bg-emerald-700"
                        >
                          追加
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
            
            {/* レコメンデーション */}
            {recommendations && recommendations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-orange-600 mb-2">アミノ酸スコアを向上させるには：</h3>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="flex justify-between items-center p-2 border-b border-orange-100 last:border-0">
                      <div>
                        <div className="font-medium">{rec.name}</div>
                        <div className="text-xs text-gray-600">GI値: {rec.gi} | ¥{Math.round(rec.price * 100)}/100g</div>
                      </div>
                      <button
                        onClick={() => addRecommendation(rec)}
                        className="bg-orange-500 text-white px-2 py-1 rounded-md text-sm hover:bg-orange-600"
                      >
                        追加
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            {/* 材料リスト */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">選択した材料</h2>
            {ingredients.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                材料がまだ選択されていません。左のパネルから材料を選択するか、プリセットレシピから始めましょう。
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                {ingredients.map((ingredient, index) => {
                  const item = ingredientCategories
                    .flatMap(cat => cat.items)
                    .find(i => i.id === ingredient.id);
                  
                  // 制限アミノ酸を多く含む材料をハイライト
                  const isHighlighted = nutrition && 
                    nutrition.aminoAcidScore.totalScore < 100 && 
                    nutritionData[ingredient.id]?.aminoAcids;
                    
                  return (
                    <div
                      key={index}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between p-3 mb-2 rounded-md cursor-move ${
                        isHighlighted 
                          ? 'bg-orange-100 border border-orange-300' 
                          : 'bg-white border border-gray-200'
                      } ${draggedItemIndex === index ? 'opacity-50' : ''}`}
                    >
                      <div className="flex-grow">
                        <div className="font-medium">{ingredient.name}</div>
                        <div className="text-sm text-gray-600">
                          GI値: {item?.gi || '?'} | ¥{Math.round(item?.price * ingredient.amount || 0)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeAmount(index, -10)}
                          className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          -10
                        </button>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={ingredient.amount}
                            onChange={(e) => setAmount(index, e.target.value)}
                            className="w-16 p-1 border rounded-md text-center"
                            min="0"
                          />
                          <span className="text-gray-600">g</span>
                        </div>
                        <button
                          onClick={() => changeAmount(index, 10)}
                          className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => removeIngredient(index)}
                          className="bg-red-100 text-red-600 hover:bg-red-200 w-8 h-8 rounded-full flex items-center justify-center ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* 栄養情報セクション */}
            {nutrition && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">栄養情報</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium mb-3 text-emerald-700">基本栄養素</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <div className="text-sm text-gray-600">レシピ全体</div>
                        <div className="text-2xl font-bold">{nutrition.totalWeight}<span className="text-sm ml-1">g</span></div>
                        <div className="mt-1">
                          <div><span className="font-medium">カロリー:</span> {nutrition.calories} kcal</div>
                          <div><span className="font-medium">タンパク質:</span> {nutrition.protein} g</div>
                          <div><span className="font-medium">原価:</span> ¥{nutrition.price}</div>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600">クッキー1枚あたり</div>
                        <div className="text-2xl font-bold">{nutrition.perCookie.weight}<span className="text-sm ml-1">g</span></div>
                        <div className="mt-1">
                          <div><span className="font-medium">カロリー:</span> {nutrition.perCookie.calories} kcal</div>
                          <div><span className="font-medium">タンパク質:</span> {nutrition.perCookie.protein} g</div>
                          <div><span className="font-medium">原価:</span> ¥{nutrition.perCookie.price}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* GI値とPFCバランス */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">GI値</div>
                        <div className="text-gray-600 text-sm">
                          {nutrition.gi < 40 ? '低GI' : nutrition.gi < 70 ? '中GI' : '高GI'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="text-xl font-medium w-10">{nutrition.gi}</div>
                        <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              nutrition.gi < 40 ? 'bg-green-500' : 
                              nutrition.gi < 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, nutrition.gi)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mb-2 font-medium">PFCバランス</div>
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div className="flex h-full">
                          <div className="bg-blue-500 h-full text-xs text-white flex items-center justify-center" 
                               style={{ width: `${nutrition.pfcRatio.protein}%` }}>
                            P {nutrition.pfcRatio.protein}%
                          </div>
                          <div className="bg-yellow-500 h-full text-xs text-white flex items-center justify-center" 
                               style={{ width: `${nutrition.pfcRatio.fat}%` }}>
                            F {nutrition.pfcRatio.fat}%
                          </div>
                          <div className="bg-green-500 h-full text-xs text-white flex items-center justify-center" 
                               style={{ width: `${nutrition.pfcRatio.carbs}%` }}>
                            C {nutrition.pfcRatio.carbs}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium mb-3 text-emerald-700">アミノ酸スコア</h3>
                    
                    {/* 総合アミノ酸スコア */}
                    {nutrition && nutrition.aminoAcidScore ? (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-medium">総合スコア</div>
                          <div className={`text-lg font-bold ${
                            nutrition.aminoAcidScore.totalScore >= 100 
                              ? 'text-green-600' 
                              : 'text-orange-600'
                          }`}>
                            {Math.round(nutrition.aminoAcidScore.totalScore)}%
                          </div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              nutrition.aminoAcidScore.totalScore >= 100 
                                ? 'bg-green-500' 
                                : 'bg-orange-500'
                            }`}
                            style={{ width: `${Math.min(100, nutrition.aminoAcidScore.totalScore)}%` }}
                          ></div>
                        </div>
                        {nutrition.aminoAcidScore.totalScore < 100 && (
                          <div className="text-sm text-orange-600 mt-1">
                            制限アミノ酸: {nutrition.aminoAcidScore.limitingAminoAcid === 'methionine_cystine' 
                              ? 'メチオニン+シスチン' 
                              : nutrition.aminoAcidScore.limitingAminoAcid === 'phenylalanine_tyrosine'
                                ? 'フェニルアラニン+チロシン'
                                : nutrition.aminoAcidScore.limitingAminoAcid}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-4">
                        栄養データが計算されていません
                      </div>
                    )}
                    
                    {/* 各アミノ酸のスコア */}
                    <div className="text-sm font-medium mb-2">各必須アミノ酸のスコア</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {nutrition && nutrition.aminoAcidScore && nutrition.aminoAcidScore.individualScores ? 
                        Object.entries(nutrition.aminoAcidScore.individualScores).map(([aa, score]) => (
                          <div key={aa} className="mb-1">
                            <div className="flex justify-between items-center mb-1">
                              <div className="text-xs">
                                {aa === 'isoleucine' ? 'イソロイシン' :
                                 aa === 'leucine' ? 'ロイシン' :
                                 aa === 'lysine' ? 'リシン（リジン）' :
                                 aa === 'methionine_cystine' ? 'メチオニン+シスチン' :
                                 aa === 'phenylalanine_tyrosine' ? 'フェニルアラニン+チロシン' :
                                 aa === 'threonine' ? 'トレオニン' :
                                 aa === 'tryptophan' ? 'トリプトファン' :
                                 aa === 'valine' ? 'バリン' :
                                 aa === 'histidine' ? 'ヒスチジン' : aa}
                              </div>
                              <div className={`text-xs font-bold ${score >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                                {Math.round(score)}%
                              </div>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${score >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                                style={{ width: `${Math.min(100, score)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                        : <div className="col-span-2 text-gray-500 text-center">栄養データが計算されていません</div>
                      }
                    </div>
                  </div>
                </div>
                
                {/* レシピまとめ - 追加セクション */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">レシピまとめ</h2>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-medium text-emerald-700 mb-2">ヨガ実践者のためのヴィーガンクッキー</h3>
                    <div className="mb-4">
                      <div className="text-gray-700 mb-3">
                        {nutrition && (
                          <>
                            このクッキーは、ヨガの強度の高いプラクティスをサポートするために
                            特別に設計された栄養バランスの良いレシピです。植物性の材料のみを使用し、
                            アミノ酸スコア{Math.round(nutrition.aminoAcidScore.totalScore)}%を実現。
                            タンパク質{nutrition.protein}g（PFC比 P:{nutrition.pfcRatio.protein}% / F:{nutrition.pfcRatio.fat}% / C:{nutrition.pfcRatio.carbs}%）で
                            体をサポートし、GI値{nutrition.gi}で安定したエネルギー補給が可能です。
                            <br /><br />
                            
                            {/* 味と栄養の特徴を説明 */}
                            <span className="font-medium">味と栄養の特徴：</span><br />
                            {ingredients.some(ing => ['oatmeal', 'oatmeal_flour'].includes(ing.id)) && 
                              '食物繊維豊富なオートミールの優しい食感と、'}
                            {ingredients.some(ing => ['almond', 'cashew', 'walnut'].includes(ing.id)) && 
                              '香ばしいナッツの風味、'}
                            {ingredients.some(ing => ['cinnamon', 'cardamom'].includes(ing.id)) && 
                              'シナモンとカルダモンの芳醇なスパイスの香り、'}
                            {ingredients.some(ing => ['ginger'].includes(ing.id)) && 
                              'ジンジャーのピリッとした刺激、'}
                            {ingredients.some(ing => ['cocoa'].includes(ing.id)) && 
                              '深みのあるココアの風味、'}
                            {ingredients.some(ing => ['kinako'].includes(ing.id)) && 
                              'きな粉のまろやかな大豆の香り、'}
                            {ingredients.some(ing => ['soy_meat'].includes(ing.id)) && 
                              '高タンパク質の大豆ミートが筋肉の回復をサポート、'}
                            {ingredients.some(ing => ['chia_seed', 'quinoa'].includes(ing.id)) && 
                              'チアシード・キヌアの良質な脂肪と必須ミネラル、'}
                            {ingredients.some(ing => ['date_syrup', 'dates', 'maple_syrup'].includes(ing.id)) && 
                              '自然な甘みで血糖値の急上昇を抑える効果、'}
                            {ingredients.some(ing => ['coconut_oil'].includes(ing.id)) && 
                              'ココナッツオイルの中鎖脂肪酸による持続的なエネルギー供給、'}
                            
                            が特徴のこのクッキーは、ヨガ後の回復だけでなく、忙しい日常の栄養補給にも最適。プラクティスのエネルギー源として、
                            または朝食・間食として、身体を内側から整える栄養満点のヴィーガンクッキーです。
                          </>
                        )}
                      </div>
                      
                      <div className="font-medium mb-1">材料：</div>
                      <div className="text-gray-700 mb-3">
                        {ingredients.map((ing, i) => (
                          <span key={ing.id}>
                            {ing.name} {ing.amount}g
                            {i < ingredients.length - 1 ? '、' : ''}
                          </span>
                        ))}
                      </div>
                      
                      <div className="font-medium mb-1">作り方：</div>
                      <div className="text-gray-700 mb-3">
                        1. 全ての材料をボウルに入れてよく混ぜ合わせます。<br />
                        2. 生地を8等分にして平たく形を整えます。<br />
                        3. 160℃に予熱したオーブンで15〜18分焼きます。<br />
                        4. 焼きあがったら完全に冷ましてからお召し上がりください。
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="font-medium">栄養情報（1枚あたり）：</div>
                        <div>重量: {nutrition.perCookie.weight}g / カロリー: {nutrition.perCookie.calories}kcal / タンパク質: {nutrition.perCookie.protein}g</div>
                        <div>アミノ酸スコア: {Math.round(nutrition.aminoAcidScore.totalScore)}% / GI値: {nutrition.gi} / 原価: ¥{nutrition.perCookie.price}</div>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700"
                      onClick={() => {
                        // クリップボードにコピーする機能
                        const text = `
ヨガ実践者のためのヴィーガンクッキー

【材料】（8枚分）
${ingredients.map(ing => `・${ing.name} ${ing.amount}g`).join('\n')}

【作り方】
1. 全ての材料をボウルに入れてよく混ぜ合わせます。
2. 生地を8等分にして平たく形を整えます。
3. 160℃に予熱したオーブンで15〜18分焼きます。
4. 焼きあがったら完全に冷ましてからお召し上がりください。

【栄養情報】
・レシピ全体: ${nutrition.totalWeight}g / ${nutrition.calories}kcal / タンパク質${nutrition.protein}g / 原価¥${nutrition.price}
・1枚あたり: ${nutrition.perCookie.weight}g / ${nutrition.perCookie.calories}kcal / タンパク質${nutrition.perCookie.protein}g / 原価¥${nutrition.perCookie.price}
・PFC比率: P:${nutrition.pfcRatio.protein}% / F:${nutrition.pfcRatio.fat}% / C:${nutrition.pfcRatio.carbs}%
・GI値: ${nutrition.gi}
・アミノ酸スコア: ${Math.round(nutrition.aminoAcidScore.totalScore)}%
                        `;
                        navigator.clipboard.writeText(text);
                        alert('レシピをクリップボードにコピーしました！');
                      }}
                    >
                      レシピをコピー
                    </button>
                  </div>
                </div>
                
                {/* 詳細栄養情報テーブル - 追加セクション */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">詳細栄養情報</h2>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">材料</th>
                          <th className="px-4 py-2 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">量(g)</th>
                          <th className="px-4 py-2 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">カロリー</th>
                          <th className="px-4 py-2 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">タンパク質</th>
                          <th className="px-4 py-2 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">脂質</th>
                          <th className="px-4 py-2 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">炭水化物</th>
                          <th className="px-4 py-2 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GI値</th>
                          <th className="px-4 py-2 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">原価</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ingredients.map((ing, index) => {
                          const nutrition = nutritionData[ing.id];
                          const item = ingredientCategories
                            .flatMap(cat => cat.items)
                            .find(i => i.id === ing.id);
                            
                          if (!nutrition || !item) return null;
                          
                          const calories = Math.round(nutrition.calories * ing.amount / 100);
                          const protein = Math.round(nutrition.protein * ing.amount / 100 * 10) / 10;
                          const fat = Math.round(nutrition.fat * ing.amount / 100 * 10) / 10;
                          const carbs = Math.round(nutrition.carbs * ing.amount / 100 * 10) / 10;
                          const price = Math.round(item.price * ing.amount);
                          
                          return (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{ing.name}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{ing.amount}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{calories}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{protein}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{fat}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{carbs}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{item.gi}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">¥{price}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-emerald-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">合計</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{nutrition.totalWeight}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{nutrition.calories}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{nutrition.protein}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{nutrition.fat}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{nutrition.carbs}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{nutrition.gi}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">¥{nutrition.price}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeganCookieApp;
