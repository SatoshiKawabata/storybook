import React from 'react';
import addons from '@kadira/storybook-addons';
import Panel from './components/Panel';
import Wrap from './components/Wrap';

function register() {
  addons.register('kadirahq/storybook-addon-knobs', () => {
    const channel = addons.getChannel();

    addons.addPanel('kadirahq/storybook-addon-knobs', {
      title: 'Knobs',
      render: () => {
        return <Panel channel={channel} />;
      },
    });
  });
}

let knobStore = {};

function createKnob(name, value, type) {
  if (knobStore[name]) {
    return knobStore[name].value;
  }

  knobStore[name] = { name, value, type };
  return value;
}

function wrap(storyFn) {
  const channel = addons.getChannel();
  const localKnobStore = {};

  const knobChanged = change => {
    const { name, value } = change;
    const { type } = localKnobStore[name];

    let formatedValue = value;
    if (type === 'object') {
      try {
        formatedValue = eval(`(${value})`); // eslint-disable-line no-eval
      } catch (e) {
        return;
      }
    }

    localKnobStore[name].value = formatedValue;
  };

  const storyRendered = () => {
    channel.emit('addon:knobs:setFields', localKnobStore);
  };


  return context => {
    // Change the global knobStore to the one local to this story
    knobStore = localKnobStore;

    channel.emit('addon:knobs:setFields', localKnobStore);
    return <Wrap {...{ context, storyFn, channel, knobChanged, storyRendered }} />;
  };
}

export { register, createKnob, wrap };
