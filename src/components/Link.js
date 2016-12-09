import React from 'react';
import { connect } from 'react-redux';
import { go } from '../connectTypes';


function Link({
  href, 
  children, 
  onPress, 
  down=false, 
  shouldDispatch=true, 
  target, 
  dispatch, 
  ...props
}) {
  let handler = handlePress.bind(null, onPress, shouldDispatch, target, dispatch);

  return (
    <a 
      href={href} 
      onClick={!down && handler || preventDefault} 
      onMouseDown={down && handler} 
      onTouchStart={down && handler} 
      target={target}
      {...props} 
    >
      {children}
    </a>
  );
}

export const Link = connect()(Link)



function handlePress(onPress, shouldDispatch, target, dispatch, e) {
    if(target !== '_blank') {
      e.preventDefault();
    }
    
    let shouldGo = true;

    if(onPress) {
      shouldGo = onPress(e); //onPress can return false to prevent dispatch
      shouldGo = typeof shouldGo === 'undefined' ? true : shouldGo;
    }

    if(shouldGo && shouldDispatch && target !== '_blank') {
      dispatch(go(href));
    }
  }

  function preventDefault(e) {
    e.preventDefault();
  }