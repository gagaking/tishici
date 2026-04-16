export async function analyzeImagePrompt(base64Image: string, mimeType: string, apiKey: string) {
  const prompt = `
请深入分析这张图片，并根据以下 9 部分架构反推 AI 绘画提示词。
所有输出必须使用中文。

架构要求：
1. 风格与效果 (Style & Effect): 极其详细地描述画风（如：赛博朋克、油画、写实摄影、二次元等）、光影质感、后期色彩处理。
2. 光影与机位 (Lighting & Camera): 描述主光方向、光比、阴影细节、景别（特写/全景）、机位角度、镜头焦段、环境反射。
3. 主体与姿态 (Subject & Pose): 详细刻画人物特征、面部表情、眼神流转、肢体微动作、头部及躯干的精确姿态。
4. 主色与氛围 (Colors & Atmosphere): 核心色调、辅助色、点缀色的搭配，以及画面传达的整体情绪氛围。
5. 背景与空间 (Background & Space): 背景的几何构成、比例关系、材质纹理、空间深度感。
6. 道具与互动 (Props & Interaction): 道具的具体类型、人物与道具的互动方式、手指关节的精细角度。
7. 动作与细节 (Action & Details): 主体正在进行的具体动作、手部细节、配饰纹理、眼神光。
8. 穿搭与风格 (Outfit & Style): 详细描述衣着材质、褶皱感、色彩和谐度、穿搭的整体风格一致性。
9. 特殊效果 (Special Effects): 视觉特效（如：粒子、光晕）、后期处理痕迹、材质的微观精度。

输出格式要求：
返回一个 JSON 对象，包含两个键：
- "zh": 包含上述 9 部分的完整详细中文解析。
- "noOutfit": 同样包含 9 部分，但第 8 部分（穿搭与风格）必须修改为只描述“角色正在做什么”，严禁出现任何关于衣服、裤子、鞋子等服饰的描述。其他部分保持详细。

示例 "noOutfit" 的第 8 部分：
错误：穿着白色衬衫和蓝色牛仔裤在跑步。
正确：角色正在充满活力地向前奔跑，双臂摆动。

请确保内容丰富、具体，不要使用笼统的词汇。
`;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not provided");
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          zh: {
            type: "OBJECT",
            properties: {
              part1: { type: "STRING" },
              part2: { type: "STRING" },
              part3: { type: "STRING" },
              part4: { type: "STRING" },
              part5: { type: "STRING" },
              part6: { type: "STRING" },
              part7: { type: "STRING" },
              part8: { type: "STRING" },
              part9: { type: "STRING" }
            },
            required: ["part1", "part2", "part3", "part4", "part5", "part6", "part7", "part8", "part9"]
          },
          noOutfit: {
            type: "OBJECT",
            properties: {
              part1: { type: "STRING" },
              part2: { type: "STRING" },
              part3: { type: "STRING" },
              part4: { type: "STRING" },
              part5: { type: "STRING" },
              part6: { type: "STRING" },
              part7: { type: "STRING" },
              part8: { type: "STRING" },
              part9: { type: "STRING" }
            },
            required: ["part1", "part2", "part3", "part4", "part5", "part6", "part7", "part8", "part9"]
          }
        },
        required: ["zh", "noOutfit"]
      }
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  
  return JSON.parse(text);
}
