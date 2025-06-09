const bcrypt = require('bcrypt');

async function testBcrypt() {
    const password = 'testPassword';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Хешированный пароль:', hashedPassword);

    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('Пароль совпадает:', isMatch);
}

testBcrypt();
