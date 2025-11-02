"use client";

import {
  type MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEYS = {
  expanded: "ai-assistant-expanded",
  triggerX: "ai-assistant-button-x",
  triggerY: "ai-assistant-button-y",
  panelX: "ai-assistant-card-x",
  panelY: "ai-assistant-card-y",
} as const;

const TRIGGER_SIZE = 64;
const PANEL_WIDTH = 432;
const PANEL_HEIGHT = 568;
const PANEL_MARGIN = 24;
const TRIGGER_MARGIN_BOTTOM = 40;

export type DragConstraints = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export interface FloatingAssistantOptions {
  defaultCollapsed: boolean;
  defaultPosition?: { x: number; y: number };
  draggable: boolean;
}

export interface FloatingAssistantState {
  cardX: MotionValue<number>;
  cardY: MotionValue<number>;
  constraints: DragConstraints;
  isDragging: boolean;
  isExpanded: boolean;
  isReady: boolean;
  setShowTooltip: (value: boolean) => void;
  showTooltip: boolean;
  toggleExpanded: () => void;
  tooltipRotate: MotionValue<number>;
  tooltipTranslateX: MotionValue<number>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  buttonX: MotionValue<number>;
  buttonY: MotionValue<number>;
  handleTooltipPointerMove: (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => void;
  resetTooltipMotion: () => void;
  triggerDragHandlers: {
    onDragEnd: () => void;
    onDragStart: () => void;
  };
  triggerDragProps: {
    drag: boolean;
    dragConstraints: DragConstraints;
    dragElastic: number;
    dragTransition: {
      bounceDamping: number;
      bounceStiffness: number;
    };
  };
  panelDragProps: {
    drag: boolean;
    dragConstraints: DragConstraints;
    dragElastic: number;
    dragMomentum: boolean;
    dragTransition: {
      bounceDamping: number;
      bounceStiffness: number;
    };
  };
}

const isBrowser = typeof window !== "undefined";

export function useFloatingAssistantState({
  defaultCollapsed,
  defaultPosition,
  draggable,
}: FloatingAssistantOptions): FloatingAssistantState {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [constraints, setConstraints] = useState<DragConstraints>({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });

  const buttonX = useMotionValue(defaultPosition?.x ?? 0);
  const buttonY = useMotionValue(defaultPosition?.y ?? 0);
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);

  const tooltipX = useMotionValue(0);
  const tooltipTranslateX = useSpring(
    useTransform(tooltipX, [-120, 120], [-20, 20]),
    { stiffness: 240, damping: 18, mass: 0.8 },
  );
  const tooltipRotate = useSpring(
    useTransform(tooltipX, [-120, 120], [-6, 6]),
    { stiffness: 220, damping: 18, mass: 0.8 },
  );

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tooltipFrameRef.current !== null) {
        cancelAnimationFrame(tooltipFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isBrowser) return;

    const storedExpanded = localStorage.getItem(STORAGE_KEYS.expanded);
    if (storedExpanded !== null) {
      setIsExpanded(storedExpanded === "true");
    } else {
      setIsExpanded(!defaultCollapsed);
    }

    const maybeSetFromStorage = (
      key: string,
      motionValue: MotionValue<number>,
      fallback?: number,
    ) => {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed = Number.parseFloat(stored);
        if (!Number.isNaN(parsed)) {
          motionValue.jump(parsed);
          return;
        }
      }
      if (typeof fallback === "number") {
        motionValue.jump(fallback);
      }
    };

    maybeSetFromStorage(STORAGE_KEYS.triggerX, buttonX, defaultPosition?.x);
    maybeSetFromStorage(STORAGE_KEYS.triggerY, buttonY, defaultPosition?.y);
    maybeSetFromStorage(STORAGE_KEYS.panelX, cardX, 0);
    maybeSetFromStorage(STORAGE_KEYS.panelY, cardY, 0);

    const readyFrame = requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => {
      cancelAnimationFrame(readyFrame);
    };
  }, [
    buttonX,
    buttonY,
    cardX,
    cardY,
    defaultCollapsed,
    defaultPosition?.x,
    defaultPosition?.y,
  ]);

  useEffect(() => {
    if (!isBrowser) return;

    const updateConstraints = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (isExpanded) {
        setConstraints({
          left: -(width / 2 - PANEL_WIDTH / 2 - PANEL_MARGIN),
          right: width / 2 - PANEL_WIDTH / 2 - PANEL_MARGIN,
          top: -(height / 2 - PANEL_HEIGHT / 2 - PANEL_MARGIN),
          bottom: height / 2 - PANEL_HEIGHT / 2 - PANEL_MARGIN,
        });
      } else {
        setConstraints({
          left: -(width / 2 - TRIGGER_SIZE / 2 - PANEL_MARGIN),
          right: width / 2 - TRIGGER_SIZE / 2 - PANEL_MARGIN,
          top: -(height - TRIGGER_MARGIN_BOTTOM - TRIGGER_SIZE),
          bottom: TRIGGER_MARGIN_BOTTOM,
        });
      }
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);

    return () => {
      window.removeEventListener("resize", updateConstraints);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!isBrowser) return;

    const unsubscribes = [
      buttonX.on("change", (value) =>
        localStorage.setItem(STORAGE_KEYS.triggerX, value.toString()),
      ),
      buttonY.on("change", (value) =>
        localStorage.setItem(STORAGE_KEYS.triggerY, value.toString()),
      ),
      cardX.on("change", (value) =>
        localStorage.setItem(STORAGE_KEYS.panelX, value.toString()),
      ),
      cardY.on("change", (value) =>
        localStorage.setItem(STORAGE_KEYS.panelY, value.toString()),
      ),
    ];

    return () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    };
  }, [buttonX, buttonY, cardX, cardY]);

  useEffect(() => {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.expanded, isExpanded.toString());
  }, [isExpanded]);

  const toggleExpanded = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      return;
    }
    setShowTooltip(false);
    setIsExpanded((prev) => !prev);
  }, [isDragging]);

  const handleTooltipPointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!triggerRef.current) return;

      if (tooltipFrameRef.current !== null) {
        cancelAnimationFrame(tooltipFrameRef.current);
      }

      const currentTarget = triggerRef.current;
      tooltipFrameRef.current = requestAnimationFrame(() => {
        const rect = currentTarget.getBoundingClientRect();
        tooltipX.set(event.clientX - rect.left - rect.width / 2);
      });
    },
    [tooltipX],
  );

  const resetTooltipMotion = useCallback(() => {
    tooltipX.stop();
    tooltipX.set(0);
  }, [tooltipX]);

  const triggerDragHandlers = useMemo(
    () => ({
      onDragStart: () => setIsDragging(true),
      onDragEnd: () => {
        window.setTimeout(() => setIsDragging(false), 100);
      },
    }),
    [],
  );

  const triggerDragProps = useMemo(
    () => ({
      drag: true,
      dragConstraints: constraints,
      dragElastic: 0.12,
      dragTransition: {
        bounceStiffness: 320,
        bounceDamping: 24,
      },
    }),
    [constraints],
  );

  const panelDragProps = useMemo(
    () => ({
      drag: draggable,
      dragConstraints: constraints,
      dragElastic: 0.08,
      dragMomentum: false,
      dragTransition: {
        bounceStiffness: 320,
        bounceDamping: 30,
      },
    }),
    [constraints, draggable],
  );

  return {
    cardX,
    cardY,
    constraints,
    isDragging,
    isExpanded,
    isReady,
    setShowTooltip,
    showTooltip,
    toggleExpanded,
    tooltipRotate,
    tooltipTranslateX,
    triggerRef,
    buttonX,
    buttonY,
    handleTooltipPointerMove,
    resetTooltipMotion,
    triggerDragHandlers,
    triggerDragProps,
    panelDragProps,
  };
}
