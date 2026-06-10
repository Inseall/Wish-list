import fs from 'fs';
import readline from 'readline';

const FILE = 'wishes.json';

const loadWishes = () => {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
};

const saveWishes = (wishes) => {
  fs.writeFileSync(FILE, JSON.stringify(wishes, null, 2));
};

const quotes = [
  'Мечтай так, словно будешь жить вечно.',
  'Великие дела начинаются с маленьких шагов.',
  'Ты ближе к цели, чем думаешь.',
  'Жизнь слишком коротка, чтобы откладывать мечты.',
  'Каждый день — это шанс стать лучше.',
  'Не бойся мечтать о большом.',
  'Действуй сейчас, не жди идеального момента.',
  'Твои мечты заслуживают воплощения.',
  'Маленький шаг сегодня — большой результат завтра.',
  'Верь в себя и всё получится.',
  'Успех — это сумма маленьких усилий каждый день.',
  'Мечты без действий остаются мечтами.',
  'Начни сейчас, стань лучше потом.',
  'Жизнь начинается за пределами зоны комфорта.',
  'Каждая мечта когда-то казалась невозможной.',
  'Не останавливайся на достигнутом.',
  'Твоё будущее создаётся тем, что ты делаешь сегодня.',
  'Смелость — это не отсутствие страха, а движение вперёд.',
  'Мечтай. Верь. Действуй.',
  'Самое сложное — сделать первый шаг.',
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) => new Promise((resolve) => {
  rl.question(question, resolve);
});

const showMenu = async () => {
  console.log('\n=== Wish List ===');
  console.log('1. Показать все желания');
  console.log('2. Добавить желание');
  console.log('3. Отметить выполненным');
  console.log('4. Удалить желание');
  console.log('5. Фильтрация');
  console.log('6. Показать цитату');
  console.log('7. Выйти');

  const choice = await ask('\nВыберите пункт: ');
  return choice.trim();
};

const showWishes = (wishes) => {
  if (wishes.length === 0) {
    console.log('\nСписок желаний пуст.');
    return;
  }

  console.log('\n=== Список желаний ===');
  wishes.forEach((wish, index) => {
    const status = wish.done ? '✅' : '⬜';
    const priority = wish.priority === 'urgent' ? '🔴 Срочно' : '🔵 Когда-нибудь';
    console.log(`${index + 1}. ${status} ${wish.title} | ${priority}`);
    console.log(`   ${wish.description}`);
    if (wish.photo) console.log(`   🔗 Фото: ${wish.photo}`);
    console.log(`   Добавлено: ${wish.date}`);
  });
};

const addWish = async (wishes) => {
  const title = await ask('Название желания: ');
  const description = await ask('Описание: ');
  const photo = await ask('Ссылка на фото (или Enter чтобы пропустить): ');
  const priority = await ask('Приоритет (1 — Срочно, 2 — Когда-нибудь): ');

  const wish = {
    id: Date.now(),
    title: title.trim(),
    description: description.trim(),
    photo: photo.trim() || null,
    priority: priority.trim() === '1' ? 'urgent' : 'someday',
    done: false,
    date: new Date().toLocaleDateString('ru-RU'),
  };

  wishes.push(wish);
  saveWishes(wishes);
  console.log('\n✅ Желание добавлено!');
};

const toggleDone = async (wishes) => {
  showWishes(wishes);
  if (wishes.length === 0) return;

  const input = await ask('\nВведите номер желания: ');
  const index = parseInt(input) - 1;

  if (index < 0 || index >= wishes.length) {
    console.log('Неверный номер.');
    return;
  }

  wishes[index].done = !wishes[index].done;
  saveWishes(wishes);
  const status = wishes[index].done ? '✅ Выполнено' : '⬜ Возвращено в список';
  console.log(`\n${status}: ${wishes[index].title}`);
};

const deleteWish = async (wishes) => {
  showWishes(wishes);
  if (wishes.length === 0) return;

  const input = await ask('\nВведите номер желания для удаления: ');
  const index = parseInt(input) - 1;

  if (index < 0 || index >= wishes.length) {
    console.log('Неверный номер.');
    return;
  }

  const title = wishes[index].title;
  wishes.splice(index, 1);
  saveWishes(wishes);
  console.log(`\n🗑️ Удалено: ${title}`);
};

const filterWishes = async (wishes) => {
  console.log('\n=== Фильтрация ===');
  console.log('1. По статусу (выполненные)');
  console.log('2. По статусу (невыполненные)');
  console.log('3. По приоритету (Срочно)');
  console.log('4. По приоритету (Когда-нибудь)');

  const choice = await ask('\nВыберите фильтр: ');

  let filtered = [];

  if (choice.trim() === '1') filtered = wishes.filter((w) => w.done);
  else if (choice.trim() === '2') filtered = wishes.filter((w) => !w.done);
  else if (choice.trim() === '3') filtered = wishes.filter((w) => w.priority === 'urgent');
  else if (choice.trim() === '4') filtered = wishes.filter((w) => w.priority === 'someday');
  else {
    console.log('Неверный пункт.');
    return;
  }

  showWishes(filtered);
};

const main = async () => {
  const wishes = loadWishes();

  while (true) {
    const choice = await showMenu();

    if (choice === '1') showWishes(wishes);
    else if (choice === '2') await addWish(wishes);
    else if (choice === '3') await toggleDone(wishes);
    else if (choice === '4') await deleteWish(wishes);
    else if (choice === '5') await filterWishes(wishes);
    else if (choice === '6') {
      const index = Math.floor(Math.random() * quotes.length);
      console.log(`\n💬 ${quotes[index]}`);
    }
    else if (choice === '7') {
      console.log('\nДо свидания!');
      rl.close();
      break;
    }
    else console.log('\nНеверный пункт, попробуй снова.');
  }
};

main();