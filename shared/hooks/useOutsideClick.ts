import { useCallback, useEffect } from 'react';

interface useOutsideClickProps {
  node: any; // reference to top level node / element in the collapsible component.
  isOpen: boolean;
  ids?: string[];
  onOutsideClick: (data?: any) => void;
}

const useOutsideClick = ({
  node,
  onOutsideClick,
  ids = [],
  isOpen,
}: useOutsideClickProps) => {
  const handleClick = useCallback(
    (e: any) => {
      const current: any = !!node && !!node.current ? node.current : null;
      if (!current) return;

      if (e.target && !current.contains(e.target)) {
        if (!ids?.includes(e.target.id)) {
          onOutsideClick();
        }
        console.log(e.target.id);
      }
    },
    [node, ids, onOutsideClick]
  );

  const attachDocumentEventListener = useCallback(
    () => document.addEventListener('mousedown', handleClick),
    [handleClick]
  );
  const removeDocumentEventListener = useCallback(
    () => document.removeEventListener('mousedown', handleClick),
    [handleClick]
  );

  useEffect(() => {
    attachDocumentEventListener();

    return () => {
      removeDocumentEventListener();
    };
  }, [isOpen, attachDocumentEventListener, removeDocumentEventListener]);
};

export default useOutsideClick;
