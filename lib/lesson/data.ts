export type Lesson = {
  id: string; stage: number; category: string; title: string; duration: string;
  objective: string; explanation: string; question: string; task: string;
  mission: string; tips: string[]; skill: string;
};

export const lessons: Lesson[] = [
  { id: 'canvas-first', stage: 0, category: 'はじめの一歩', title: 'キャンバスに線を引いてみよう', duration: '5分', objective: 'ブラシの太さと筆圧を感じながら、まず一本の線を描きます。', explanation: 'デジタルの絵も、最初は線から。きれいに描こうとせず、手を動かす感覚を確かめてみましょう。線はあとから何度でもやり直せます。', question: '線をゆっくり引いたときと、すばやく引いたとき。どんな違いを感じますか？', task: 'キャンバスの上に、長さの違う線を3本描きましょう。', mission: '好きな色と太さを選んで、今日の気分を線で表してみましょう。', tips: ['線がぶれても大丈夫。描く速さを少し変えてみよう。', '細い線と太い線を描き比べてみよう。'], skill: 'line-control' },
  { id: 'undo-confidence', stage: 0, category: 'はじめの一歩', title: 'Undoで気軽に試してみよう', duration: '4分', objective: 'UndoとRedoを使い、失敗を気にせず試せることを体験します。', explanation: 'デジタルでは操作を戻したり、戻した操作をやり直したりできます。迷ったら一度試して、見比べてから決めてみましょう。', question: '戻す前と後で、絵のどこが変わりましたか？', task: '線を描き、Undoで戻してからRedoで復元しましょう。', mission: '線の色や太さを変えて、いちばんしっくりくる組み合わせを探しましょう。', tips: ['上部の戻る・やり直しボタンを使えます。', 'キーボードでは Ctrl+Z / Ctrl+Shift+Z でも操作できます。'], skill: 'line-control' },
  { id: 'simple-shapes', stage: 1, category: '形をとらえる', title: '丸と四角で形を組み立てよう', duration: '8分', objective: '図形を使って、複雑なものをシンプルな形に分けて見ます。', explanation: '身近なものも、丸や四角、三角の組み合わせで眺めることができます。輪郭を細かく追う前に、大きな形を見つけてみましょう。', question: 'マグカップを丸と四角に分けると、どんな形になりますか？', task: '丸をひとつ、四角をひとつ描いて、重ねてみましょう。', mission: '丸と四角を組み合わせて、好きなもののシルエットを作りましょう。', tips: ['左のツールから楕円や四角を選べます。', '形を重ねて、見え方の変化を観察しよう。'], skill: 'shape' },
  { id: 'layer-basics', stage: 2, category: 'レイヤー', title: 'レイヤーを分けて描いてみよう', duration: '7分', objective: '線と色を別々のレイヤーに分ける利点を体験します。', explanation: 'レイヤーは透明なシートのようなもの。内容ごとに分けておけば、ほかの部分に触れずに調整できます。', question: '線と色を別のレイヤーにすると、どんなとき便利でしょう？', task: 'レイヤーを追加して、それぞれに線と丸を描いてみましょう。', mission: 'レイヤーの表示を切り替えて、絵がどう見えるか確かめましょう。', tips: ['右のレイヤーパネルから追加できます。', 'レイヤー名をクリックすると名前を変えられます。'], skill: 'layer' },
  { id: 'light-and-shadow', stage: 4, category: '光と色', title: '光の向きを考えて影を置こう', duration: '10分', objective: '光が当たる場所と影になる場所の関係を考えます。', explanation: '光の向きをひとつ決めると、影の場所も決まります。丸い形に明るい面と暗い面を作って立体感を試しましょう。', question: '光が左上から来るとき、影はどちらにできそうですか？', task: '円の片側に暗めの色を重ね、立体感を表現しましょう。', mission: '好きな形に光と影を足して、立体に見えるか試しましょう。', tips: ['色を少し暗くして、重ね塗りモードも試してみよう。', '影の形をよく見て、光の反対側に置こう。'], skill: 'lighting' },
  { id: 'character-sketch', stage: 6, category: 'キャラクター', title: '丸と線でポーズを考えよう', duration: '12分', objective: '丸と線を組み合わせ、キャラクターの動きが伝わる形を考えます。', explanation: '人体を最初から細かく描く必要はありません。頭を丸、体を線や大きな形で置いて、ポーズの流れをつかみましょう。', question: '同じキャラクターでも、傾きや手足の向きで印象はどう変わりますか？', task: '頭の丸と体の中心線を描いて、簡単なポーズを作りましょう。', mission: '「手を振る」「走る」など、動きのあるポーズをひとつ描きましょう。', tips: ['最初は一本の動きの線から始めよう。', '左右反転すると、形のバランスに気づきやすくなります。'], skill: 'pose' },
];

export const stages = [
  { id: 0, name: 'キャンバス', subtitle: 'まず描いてみる', icon: '✳', color: 'peach' },
  { id: 1, name: '線と形', subtitle: '形をとらえる', icon: '◯', color: 'lavender' },
  { id: 2, name: 'レイヤー', subtitle: '描き方を整理する', icon: '▱', color: 'blue' },
  { id: 3, name: '立体と遠近', subtitle: '奥行きをつくる', icon: '◇', color: 'mint' },
  { id: 4, name: '光と色', subtitle: '光を描く', icon: '☼', color: 'yellow' },
  { id: 5, name: '選択と編集', subtitle: '形を整える', icon: '⌖', color: 'pink' },
  { id: 6, name: 'キャラクター', subtitle: '人物を描く', icon: '♧', color: 'peach' },
  { id: 7, name: 'キャラクター仕上げ', subtitle: '一枚の作品へ', icon: '✦', color: 'lavender' },
  { id: 8, name: '背景と構図', subtitle: '世界をつくる', icon: '▧', color: 'blue' },
  { id: 9, name: 'Final Project', subtitle: '作品を完成させる', icon: '✧', color: 'yellow' },
];
