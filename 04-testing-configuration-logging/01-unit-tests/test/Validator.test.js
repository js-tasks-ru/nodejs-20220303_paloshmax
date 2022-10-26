const Validator = require('../Validator');
const expect = require('chai').expect;

/// Я бы воспользовался Jest, так как она актуальнее и документация по ней хорошая
/// Но так как тут стоит Mocha и Chai воспользуюсь этим

/// Запуск только этого теста
/// npm run test-mocha 04-testing-configuration-logging/01-unit-tests/test/Validator.test.js

function checker(settings = {}, testing = {}) {
  const validator = new Validator(settings);
  const errors = validator.validate(testing);
  let settingsKey = Object.keys(settings);

  expect(errors.length).not.equal(0);

  /// Случай с неверным типом в else
  if (errors.length === settingsKey.length) {
    expect(errors).length(settingsKey.length);
  } else {
    /// Меняем ключи на единственный
    settingsKey = [errors[0].field];
    expect(errors).length(1);
  }

  const errorIterator = errors[Symbol.iterator]();

  for (const key of settingsKey) {
    const currentErr = errorIterator.next().value;
    let testingValues;

    expect(currentErr).property('field').and.equal(key);
    switch (key) {
      case 'name':
        testingValues = [`too short, expect ${settings[key].min}, got ${testing[key].length}`, `too long, expect ${settings[key].max}, got ${testing[key].length}`, `expect ${settings[key].type}, got ${typeof testing[key]}`];
        break;
      case 'age':
        testingValues = [`too little, expect ${settings[key].min}, got ${testing[key]}`, `too big, expect ${settings[key].max}, got ${testing[key]}`, `expect ${settings[key].type}, got ${typeof testing[key]}`];
        break;
    }
    if (testingValues) expect(currentErr).property('error').and.oneOf(testingValues);
  }
}

describe('testing-configuration-logging/unit-tests', () => {
  describe('Validator', () => {
    it('name меньше', () => {
      const settings = {
        name: {
          type: 'string',
          min: 10,
          max: 20,
        },
      };

      const testing = {
        name: 'Lalala',
      };

      checker(settings, testing);
    });

    it('name больше', () => {
      const settings = {
        name: {
          type: 'string',
          min: 10,
          max: 20,
        },
      };

      const testing = {
        name: 'LalalaLalalaLalalaLalalaLalalaLalala',
      };

      checker(settings, testing);
    });

    it('age меньше', () => {
      const settings = {
        age: {
          type: 'number',
          min: 18,
          max: 35,
        },
      };

      const testing = {
        age: 17,
      };

      checker(settings, testing);
    });

    it('age больше', () => {
      const settings = {
        age: {
          type: 'number',
          min: 18,
          max: 35,
        },
      };

      const testing = {
        age: 36,
      };

      checker(settings, testing);
    });

    it('смешанный тест со всеми полями: name больше, age меньше', () => {
      const settings = {
        name: {
          type: 'string',
          min: 10,
          max: 20,
        },
        age: {
          type: 'number',
          min: 18,
          max: 35,
        },
      };

      const testing = {
        name: 'LalalaLalalaLalalaLalala',
        age: 17,
      };

      checker(settings, testing);
    });

    it('name имеет другой тип данных', () => {
      const settings = {
        name: {
          type: 'string',
          min: 10,
          max: 20,
        },
      };

      const testing = {
        name: 17,
      };

      checker(settings, testing);
    });

    it('age имеет другой тип данных', () => {
      const settings = {
        age: {
          type: 'number',
          min: 18,
          max: 35,
        },
      };

      const testing = {
        age: 'Lalala',
      };

      checker(settings, testing);
    });

    it('смешанный тест со всеми полями (поля имеют перепутанный тип): name больше, age меньше', () => {
      const settings = {
        name: {
          type: 'string',
          min: 10,
          max: 20,
        },
        age: {
          type: 'number',
          min: 18,
          max: 35,
        },
      };

      const testing = {
        name: 17,
        age: 'LalalaLalalaLalalaLalala',
      };

      checker(settings, testing);
    });

    it('тест на отсутствие ошибок', () => {
      const settings = {
        name: {
          type: 'string',
          min: 10,
          max: 20,
        },
        age: {
          type: 'number',
          min: 18,
          max: 35,
        },
      };
      const testing = {
        name: 'LalalaLalala',
        age: 27,
      };

      const validator = new Validator(settings);
      const errors = validator.validate(testing);

      /// глубокое сравнение - eql,
      /// так как equal проверяет как оператор ===, что не подходит в нашем случае
      expect(errors).eql([]);
    });
  });
});
