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

    expect(currentErr).property('field').and.equal(key);
    switch (key) {
      case 'name':
        expect(currentErr)
          .property('error')
          .and.oneOf([`too short, expect ${settings.name.min}, got ${testing.name.length}`, `too long, expect ${settings.name.max}, got ${testing.name.length}`, `expect ${settings.name.type}, got ${typeof testing.name}`]);
        break;
      case 'age':
        expect(currentErr)
          .property('error')
          .and.oneOf([`too little, expect ${settings.age.min}, got ${testing.age}`, `too big, expect ${settings.age.max}, got ${testing.age}`, `expect ${settings.age.type}, got ${typeof testing.age}`]);
        break;
    }
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
