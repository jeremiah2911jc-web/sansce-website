// Shared by publication checks and the server-side assistant style instructions.
export const prohibitedSiteCopy = [
 ['禁用詞彙', '口徑|對帳|真正|從來|往往|其實'],
 ['空泛前導', '值得注意的是|值得警醒|更重要的是|這也提醒我們|讓我們先思考|很多時候|有一個更前面的問題|背後還有一個問題|一個經常被忽略的問題'],
 ['空泛套語', '我們很容易問|一個很深的|整理情緒|需要一直記得|長出來'],
 ['自動推論', '自動變成|自動取得|自動增加|自動完成|自動涵蓋|自動等於']
];
export const publicCopyStyleInstruction = `網站用語規則同樣適用每次回答：禁止使用以下詞語與套句：${prohibitedSiteCopy.map(([,terms])=>terms.split('|').join('、')).join('；')}。面積直接說明是否含公設、是否包含車位及計算基準；費用列明比較項目與負擔範圍。依問題說明依據、條件與實際影響，不用空泛強調或模糊前導。`;
