import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export const Portal = ({ children, layer }) => {
  const mount = document.getElementById(`${ layer }-root`);
  const el = document.createElement('div');
  el.classList.add(`${ layer }-container`)

  useEffect(() => {
    mount.appendChild(el);
    return () => mount.removeChild(el);
  }, [el, mount]);

  return createPortal(children, el)
};
