import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

interface ComponentSliderProps {
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (value: number) => void;
    gradient: [number, number, number];
    lower: number;
    target: number;
    upper: number;
    disabled?: boolean;
}

export default function ComponentSlider({ 
    min,
    max,
    step = 0.01,
    value, 
    onChange,
    gradient,
    lower,
    target,
    upper,
    disabled = false 
}: ComponentSliderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const debounceTimerRef = useRef<NodeJS.Timeout>();
    
    const SNAP_DISTANCE = 0.08;
    const round2 = (v: number) => Math.round(v * 100) / 100;
    
    // Debug potential range issues
    useEffect(() => {
        const range = max - min;
        
        if (range <= 0) {
            console.error(`[SLIDER] Invalid range: min=${min}, max=${max}, range=${range}`);
        }
        if (range < 0.01) {
            console.warn(`[SLIDER] Very small range detected: min=${min}, max=${max}, range=${range}`);
        }
        if (step > range / 2) {
            console.warn(`[SLIDER] Step size too large: step=${step}, range=${range}`);
        }
        if (value < min || value > max) {
            console.warn(`[SLIDER] Value out of range: value=${value}, min=${min}, max=${max}`);
        }
        
        // Validate tick points
        if (lower < min || lower > max) {
            console.warn(`[SLIDER] Lower tick out of range: lower=${lower}, min=${min}, max=${max}`);
        }
        if (target < min || target > max) {
            console.warn(`[SLIDER] Target tick out of range: target=${target}, min=${min}, max=${max}`);
        }
        if (upper < min || upper > max) {
            console.warn(`[SLIDER] Upper tick out of range: upper=${upper}, min=${min}, max=${max}`);
        }
        
        // Validate gradient values
        gradient.forEach((gradVal, idx) => {
            if (gradVal < min || gradVal > max) {
                console.warn(`[SLIDER] Gradient[${idx}] out of range: value=${gradVal}, min=${min}, max=${max}`);
            }
        });
    }, [min, max, step, value, lower, target, upper, gradient]);
    
    const getPercent = useCallback((val: number) => ((val - min) / (max - min)) * 100, [min, max]);
    const thumbPercent = getPercent(value);

    // ALWAYS show all three tick marks (clinical safety requirement)
    const tickPoints = useMemo(() => {
        // Ensure tick points are within valid range
        const validLower = Math.max(min, Math.min(max, lower));
        const validTarget = Math.max(min, Math.min(max, target));
        const validUpper = Math.max(min, Math.min(max, upper));
        
        // Calculate differences for smart label styling (NOT hiding ticks)
        const lowerTargetDiff = Math.abs(validTarget - validLower);
        const targetUpperDiff = Math.abs(validUpper - validTarget);
        const range = max - min;
        const isVeryClose = lowerTargetDiff < Math.max(2, range * 0.05) || targetUpperDiff < Math.max(2, range * 0.05);
        
        // ALWAYS show all three ticks - clinical safety requirement
        const allTicks = [
            { val: validLower, key: 'lower', label: round2(validLower), isVeryClose },
            { val: validTarget, key: 'target', label: round2(validTarget), isVeryClose },
            { val: validUpper, key: 'upper', label: round2(validUpper), isVeryClose }
        ];
        
        return allTicks;
    }, [min, max, lower, target, upper]);

    // AppTemplate EXACT gradient calculation with validation
    const gradientBackground = useMemo(() => {
        const range = max - min;
        if (range <= 0) {
            return '#ddd'; // Fallback for invalid range
        }
        
        // Validate gradient array has 3 valid numbers
        if (!gradient || gradient.length !== 3 || gradient.some(g => isNaN(g) || g === null || g === undefined)) {
            // Use default gradient based on lower/target/upper (AppTemplate fallback)
            const defaultGradient = [lower, target, upper];
            const validGradient = defaultGradient.map(g => Math.max(min, Math.min(max, g)));
            
            const validLower = Math.max(min, Math.min(max, lower));
            const validUpper = Math.max(min, Math.min(max, upper));
            
            // AppTemplate EXACT gradient logic with CSS variable colors
            const lowerP = ((validLower - min) / range) * 100;
            const startP = ((validGradient[0] - min) / range) * 100;  // gradient[0]
            const centerP = ((validGradient[1] - min) / range) * 100; // gradient[1]  
            const endP = ((validGradient[2] - min) / range) * 100;    // gradient[2]
            const upperP = ((validUpper - min) / range) * 100;

            const clampP = (p: number) => Math.max(0, Math.min(100, p));

            // AppTemplate exact gradient with blue color scheme
            return `linear-gradient(
                to right,
                #ddd 0%,
                #ddd ${clampP(lowerP)}%,
                #fff ${clampP(lowerP)}%,
                #fff ${clampP(startP)}%,
                #d0ebff ${clampP(centerP)}%,
                #82c8ff ${clampP(endP)}%,
                #fff ${clampP(upperP)}%,
                #ddd ${clampP(upperP)}%,
                #ddd 100%
            )`;
        }
        
        // AppTemplate EXACT gradient calculation - match their logic precisely
        const validLower = Math.max(min, Math.min(max, lower));
        const validUpper = Math.max(min, Math.min(max, upper));
        const validGradient = gradient.map(g => Math.max(min, Math.min(max, g)));
        
        // Check if gradient has actual variation (start≠center≠end)
        const hasGradientVariation = !(validGradient[0] === validGradient[1] && validGradient[1] === validGradient[2]);
        
        // Fix: When no gradient variation, create meaningful gradient from clinical ranges
        let finalGradientArray = validGradient;
        if (!hasGradientVariation) {
            // Use clinical ranges: lower → target → upper for gradient progression
            const validTarget = Math.max(min, Math.min(max, target));
            finalGradientArray = [validLower, validTarget, validUpper];
        }
        
        // AppTemplate's exact percentage calculations (using potentially fixed gradient)
        const lowerP = ((validLower - min) / range) * 100;      // props.lower
        const startP = ((finalGradientArray[0] - min) / range) * 100; // gradient[0] (possibly fixed)
        const centerP = ((finalGradientArray[1] - min) / range) * 100; // gradient[1] (possibly fixed)
        const endP = ((finalGradientArray[2] - min) / range) * 100;   // gradient[2] (possibly fixed)
        const upperP = ((validUpper - min) / range) * 100;      // props.upper

        // Ensure percentages are in valid range [0, 100]
        const clampP = (p: number) => Math.max(0, Math.min(100, p));

        // AppTemplate EXACT gradient with blue color scheme:
        // var(--track-bg) = #ddd, var(--slider-start) = #fff, 
        // var(--slider-mid) = #d0ebff, var(--slider-center) = #82c8ff (lightened from #339af0)
        const finalGradient = `linear-gradient(
            to right,
            #ddd 0%,
            #ddd ${clampP(lowerP)}%,
            #fff ${clampP(lowerP)}%,
            #fff ${clampP(startP)}%,
            #d0ebff ${clampP(centerP)}%,
            #82c8ff ${clampP(endP)}%,
            #fff ${clampP(upperP)}%,
            #ddd ${clampP(upperP)}%,
            #ddd 100%
        )`;
        
        return finalGradient;
    }, [min, max, lower, target, upper, gradient]);

    // AppTemplate snap behavior with validation
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        let val = Number(event.target.value);
        
        // Ensure value is within bounds first
        val = Math.max(min, Math.min(max, val));
        
        // Check for snap targets (to lower, target, upper)
        for (const { val: snapVal } of tickPoints) {
            if (Math.abs(val - snapVal) < SNAP_DISTANCE) {
                val = snapVal;
                break;
            }
        }
        
        val = round2(val);
        onChange(val);
    };

    // Step enforcement (debounced like AppTemplate) with special handling
    const enforceStep = useCallback((inputValue: number) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
            let enforcedValue = inputValue;
            
            // Ensure within bounds first
            enforcedValue = Math.max(min, Math.min(max, enforcedValue));
            
            // Apply step size if valid
            if (step && step > 0) {
                enforcedValue = Math.round(enforcedValue / step) * step;
            }
            
            // Final rounding and validation
            enforcedValue = round2(enforcedValue);
            enforcedValue = Math.max(min, Math.min(max, enforcedValue));
            
            if (Math.abs(enforcedValue - value) > 0.001) {
                onChange(enforcedValue);
            }
        }, 400);
    }, [min, max, step, value, onChange]);

    useEffect(() => {
        enforceStep(value);
    }, [value, enforceStep]);

    return (
        <div className="slider-wrap" style={{ position: 'relative', width: '100%', padding: '1px 0 20px' }}>
            {/* AppTemplate Native Range Input with Gradient */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleInput}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onTouchEnd={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                disabled={disabled}
                className="slider"
                style={{
                    width: '100%',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    height: '10px', // Slightly thinner for compactness
                    borderRadius: '5px',
                    outline: 'none',
                    margin: 0,
                    backgroundColor: '#ddd',
                    backgroundImage: gradientBackground,
                    backgroundSize: 'calc(100% - 18px) 100%',
                    backgroundPosition: '9px 0',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 1
                }}
            />

            {/* STATIC Tick Overlay (NEVER moves) - Ultra Compact */}
            <div className="tick-overlay" style={{
                position: 'absolute',
                top: '5px', // More compact positioning
                left: '9px',
                right: '9px',
                height: '24px', // Increased height to accommodate longer tick marks
                pointerEvents: 'none',
                zIndex: 1
            }}>
                {tickPoints.map((tick) => (
                    <div
                        key={tick.key}
                        className="custom-tick"
                        style={{
                            position: 'absolute',
                            left: `${getPercent(tick.val)}%`,
                            top: 0,
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {/* Vertical tick mark lines to show position - Compact */}
                        <div className={`tick-bar ${tick.key}`} style={{
                            width: '2px',
                            height: '16px', // Same height for all tick marks
                            background: tick.key === 'target' ? '#74b9ff' : '#495057', // Target in lighter blue
                            borderRadius: '1px',
                            opacity: tick.key === 'target' ? 1 : 0.4 // Make upper/lower transparent but visible
                        }} />
                        <div className="tick-label" style={{
                            marginTop: '1px', // Minimal gap after the line
                            fontSize: '0.9rem', // Even bigger font size
                            color: '#6c757d',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            fontWeight: '700', // Bold for all values
                            textShadow: tick.key === 'target' ? '0 0 2px rgba(255,255,255,0.9)' : 'none', // Shadow only for target
                            background: tick.key === 'target' ? 'rgba(255,255,255,0.8)' : 'transparent', // Background only for target
                            padding: tick.key === 'target' ? '1px 3px' : '0', // Padding only for target
                            borderRadius: tick.key === 'target' ? '2px' : '0', // Border radius only for target
                            border: tick.key === 'target' ? '1px solid rgba(0,0,0,0.1)' : 'none', // Border only for target
                            zIndex: tick.key === 'target' ? 3 : 2, // Target label on top
                            lineHeight: '1.1', // Tighter line spacing
                            opacity: tick.key === 'target' ? 1 : 0.5 // Make upper/lower labels transparent but visible
                        }}>
                            {typeof tick.label === 'number' ? round2(tick.label) : tick.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Dragging Tooltip */}
            {isDragging && (
                <div className="slider-tooltip" style={{
                    position: 'absolute',
                    top: '-20px',
                    left: `calc(${thumbPercent}% + 9px)`,
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    padding: '3px 6px',
                    borderRadius: '4px',
                    background: '#333',
                    color: '#fff',
                    fontSize: '0.8rem',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    transition: 'opacity 0.1s',
                    fontWeight: 500
                }}>
                    {round2(value)}
                </div>
            )}

            {/* AppTemplate EXACT CSS */}
            <style jsx>{`
                .slider-wrap {
                    position: relative;
                    width: 100%;
                    padding: 2px 0 28px; /* Increased bottom padding for longer tick marks */
                }

                .slider {
                    width: 100%;
                    appearance: none;
                    -webkit-appearance: none;
                    height: 10px;
                    border-radius: 5px;
                    outline: none;
                    margin: 0;
                    background-color: #ddd;
                    background-size: calc(100% - 18px) 100%;
                    background-position: 9px 0;
                    background-repeat: no-repeat;
                    z-index: 1;
                }

                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #fff;
                    border: 3px solid #6c757d;
                    box-shadow: 0 3px 12px rgba(0,0,0,0.15);
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    top: -6px;
                    z-index: 2;
                }

                .slider::-webkit-slider-runnable-track {
                    height: 10px;
                    border-radius: 5px;
                }

                .slider::-ms-fill-lower,
                .slider::-ms-fill-upper {
                    background: none;
                }

                .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #fff;
                    border: 3px solid #6c757d;
                    box-shadow: 0 3px 12px rgba(0,0,0,0.15);
                    cursor: pointer;
                }

                .slider::-moz-range-track {
                    height: 10px;
                    border-radius: 5px;
                    background: transparent;
                }

                .tick-overlay {
                    position: absolute;
                    top: 7px;
                    left: 9px;
                    right: 9px;
                    height: 32px; /* Increased to accommodate longer tick marks */
                    pointer-events: none;
                    z-index: 1;
                }

                .custom-tick {
                    position: absolute;
                    top: 0;
                    transform: translateX(-50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .tick-bar {
                    width: 2px;
                    height: 16px; /* Same height for all tick marks */
                    background: #495057;
                    opacity: 0.4; /* Make upper/lower tick bars transparent by default */
                }

                .tick-bar.target {
                    height: 16px; /* Same height as others, differentiated by opacity and color */
                    opacity: 1; /* Keep target tick bar fully visible */
                }

                .tick-label {
                    margin-top: 1px;
                    font-size: 0.52rem;
                    color: #333;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0.5; /* Make labels transparent by default (target overrides with inline style) */
                }

                .slider-tooltip {
                    position: absolute;
                    top: -20px;
                    z-index: 10;
                    padding: 3px 6px;
                    border-radius: 4px;
                    background: #333;
                    color: #fff;
                    font-size: 0.8rem;
                    pointer-events: none;
                    white-space: nowrap;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    transition: opacity 0.1s;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
} 