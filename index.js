'use strict';

const syllable = require('syllable');
const natural = require('natural');
const Tagger = natural.BrillPOSTagger;
const tokenizer = new natural.WordTokenizer();

const BASE = "./node_modules/natural/lib/natural/brill_pos_tagger";
const RULES = BASE + "/data/English/tr_from_posjs.txt";
const LEXICON = BASE + "/data/English/lexicon_from_posjs.json";
const DEFAULT_CATEGORY = 'N';

function tagWords(wordArr, next) {
  let tagger = new Tagger(LEXICON, RULES, DEFAULT_CATEGORY, (err) => {
    if (err) {
      return next(err);
    }

    return next(null, JSON.stringify(tagger.tag(wordArr)));
  });
}

let Haiku = function () {
  let dataset = {};

  function randomProp(key) {
    let dataKey = dataset[key];
    let keys = Object.keys(dataKey);
    let randKey = Math.floor(Math.random() * keys.length);

    return dataKey[keys[randKey]];
  }

  function updateDataset(POSArr, next) {
    POSArr.forEach((word) => {
      word = word.reverse();
      if (!dataset[word[0]]) {
        dataset[word[0]] = {};
      }

      let wordItem = word[1].toLowerCase();

      dataset[word[0]][wordItem] = {
        word: wordItem,
        count: syllable(wordItem)
      };
    });

    next(null, dataset);
  }

  this.addToDataset = function (text, next) {
    let wordArr = tokenizer.tokenize(text);

    tagWords(wordArr, (err, resp) => {
      if (err) {
        return next(err);
      }

      let POSArr = JSON.parse(resp);

      updateDataset(POSArr, next);
    });
  };

  this.generate = function () {
    let syllableCountFirst = 0;
    let syllableCountSecond = 0;
    let syllableCountThird = 0;
    let first;
    let firstSentence = [];
    let second;
    let secondSentence = [];
    let third;
    let thirdSentence = [];

    // POS options listed here https://cs.nyu.edu/grishman/jet/guide/PennPOS.html
    // 5 syllables: DT - JJ - NN
    // 7 syllables: PRP - RB - VBZ - RB
    // 5 syllables: VBN - VBG - RB

    first = [randomProp('DT'), randomProp('JJ'), randomProp('NN')];

    for (let i = 0; i < first.length; i++) {
      let prop = first[i];
      syllableCountFirst += prop.count;
      firstSentence.push(prop.word);

      if (syllableCountFirst > 4) {
        break;
      }
    }

    second = [randomProp('PRP'), randomProp('RB'), randomProp('VBZ'), randomProp('RB')];

    for (let i = 0; i < second.length; i++) {
      let prop = second[i];
      syllableCountSecond += prop.count;
      secondSentence.push(prop.word);

      if (syllableCountSecond > 5) {
        break;
      }
    }

    third = [randomProp('VBN'), randomProp('VBG'), randomProp('RB')];

    for (let i = 0; i < third.length; i++) {
      let prop = third[i];
      syllableCountThird += prop.count;
      thirdSentence.push(prop.word);

      if (syllableCountThird > 4) {
        break;
      }
    }

    return [firstSentence.join(' '), secondSentence.join(' '), thirdSentence.join(' ')];
  };
};

module.exports = Haiku;
