import React from "react";
import { ProblemData } from "../../types";

const stepColors = [
  "#dc2626", // red-600
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#9333ea", // purple-600
  "#ea580c", // orange-600
];

const DIGIT_W = 1.4; // rem
const ROW_H = 1.8; // rem

interface DigitProps {
  val: string | number;
  row: number;
  col: number;
  color?: string;
  opacity?: number;
}

const Digit: React.FC<DigitProps> = ({ val, row, col, color, opacity = 1 }) => (
  <div 
    className="absolute flex justify-center items-center font-mono font-bold"
    style={{ 
      left: `${col * DIGIT_W}rem`, 
      top: `${row * ROW_H}rem`,
      width: `${DIGIT_W}rem`,
      height: `${ROW_H}rem`,
      color: color || 'black',
      opacity,
      fontSize: '1.125rem' // text-lg
    }}
  >
    {val}
  </div>
);

export default function LongDivisionRenderer({ data, showAnswer, answer, steps }: { data: ProblemData; showAnswer: boolean; answer: string; steps?: any[] }) {
  const { dividend, divisor } = data;
  const dividendStr = dividend.toString();
  const divisorStr = divisor.toString();

  return (
    <div className="flex items-start font-mono relative break-inside-avoid" style={{ 
      paddingBottom: showAnswer && steps ? `${(steps.length * 2 + 1) * ROW_H}rem` : '1rem',
      paddingRight: '2rem'
    }}>
      {/* Divisor */}
      <div className="flex justify-end items-center font-bold text-lg" style={{ 
        width: `${divisorStr.length * DIGIT_W}rem`,
        height: `${ROW_H}rem`,
        marginTop: `${ROW_H}rem`,
        paddingRight: '0.6rem'
      }}>
        {divisorStr}
      </div>

      {/* Main Area */}
      <div className="relative">
        {/* Bracket SVG - Fixed shape, not stretched */}
        <svg 
          className="absolute overflow-visible pointer-events-none" 
          style={{ 
            left: '-0.5rem', 
            top: `${ROW_H}rem`,
            width: '1rem',
            height: `${ROW_H}rem`
          }}
          viewBox="0 0 10 40"
        >
          <path 
            d="M 0 40 Q 8 20 0 0" 
            fill="none" 
            stroke="black" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          <line 
            x1="0" y1="0" 
            x2={dividendStr.length * DIGIT_W * 16 + 20} 
            y2="0" 
            stroke="black" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
        </svg>

        <div className="relative" style={{ width: `${dividendStr.length * DIGIT_W}rem` }}>
          {/* Quotient */}
          {showAnswer && steps && steps.map((step, idx) => (
            <Digit key={idx} val={step.quotientDigit} row={0} col={step.digitIndex} color="#dc2626" />
          ))}
          {showAnswer && steps && steps[steps.length - 1].remainder > 0 && (
            <div className="absolute whitespace-nowrap text-red-600 font-bold text-sm" style={{ 
              left: `${dividendStr.length * DIGIT_W + 0.5}rem`, 
              top: '0.2rem' 
            }}>
              R {steps[steps.length - 1].remainder}
            </div>
          )}

          {/* Dividend */}
          {dividendStr.split('').map((d, i) => (
            <Digit key={i} val={d} row={1} col={i} />
          ))}

          {/* Steps */}
          {showAnswer && steps && steps.map((step, idx) => {
            const color = stepColors[idx % stepColors.length];
            const productRow = 2 + idx * 2;
            const remainderRow = 3 + idx * 2;
            
            const productStr = step.product.toString();
            const remainderStr = step.remainder.toString();
            
            return (
              <React.Fragment key={idx}>
                {/* Product - Aligned right to the current digitIndex */}
                {productStr.split('').map((d, i) => (
                  <Digit 
                    key={i} 
                    val={d} 
                    row={productRow} 
                    col={step.digitIndex - (productStr.length - 1) + i} 
                    color={color} 
                  />
                ))}
                {/* Minus sign */}
                <div 
                  className="absolute font-bold" 
                  style={{ 
                    left: `${(step.digitIndex - productStr.length) * DIGIT_W + 0.2}rem`, 
                    top: `${productRow * ROW_H}rem`,
                    height: `${ROW_H}rem`,
                    display: 'flex',
                    alignItems: 'center',
                    color 
                  }}
                >
                  -
                </div>
                {/* Subtraction Line */}
                <div 
                  className="absolute border-b-2 border-current" 
                  style={{ 
                    left: `${(step.digitIndex - productStr.length + 1) * DIGIT_W}rem`, 
                    width: `${productStr.length * DIGIT_W}rem`, 
                    top: `${(productRow + 0.85) * ROW_H}rem`,
                    color 
                  }}
                ></div>

                {/* Remainder */}
                {remainderStr.split('').map((d, i) => {
                  // Skip leading zero if it's followed by other digits
                  const isLeadingZero = remainderStr.length > 1 && i === 0 && d === '0';
                  if (isLeadingZero) return null;
                  
                  return (
                    <Digit 
                      key={i} 
                      val={d} 
                      row={remainderRow} 
                      col={step.digitIndex - (remainderStr.length - 1) + i} 
                      color={color} 
                    />
                  );
                })}

                {/* Arrow and Brought down digit */}
                {idx < steps.length - 1 && (
                  <>
                    <Digit 
                      val={dividendStr[step.digitIndex + 1]} 
                      row={remainderRow} 
                      col={step.digitIndex + 1} 
                      color={stepColors[(idx + 1) % stepColors.length]}
                      opacity={0.6}
                    />
                    {/* Arrow SVG */}
                    <svg 
                      className="absolute overflow-visible pointer-events-none" 
                      style={{ 
                        left: `${(step.digitIndex + 1) * DIGIT_W + DIGIT_W/2}rem`, 
                        top: `${1.8 * ROW_H}rem`,
                        width: '1px',
                        opacity: 0.6
                      }}
                    >
                      <defs>
                        <marker id={`arrow-${idx}`} markerWidth="5" markerHeight="5" refX="0" refY="2.5" orient="auto">
                          <path d="M 0 0 L 5 2.5 L 0 5 z" fill={stepColors[(idx + 1) % stepColors.length]} />
                        </marker>
                      </defs>
                      <line 
                        x1="0" y1="0" 
                        x2="0" y2={`${(remainderRow - 1.8) * ROW_H * 16 - 5}px`} 
                        stroke={stepColors[(idx + 1) % stepColors.length]} 
                        strokeWidth="1.5" 
                        markerEnd={`url(#arrow-${idx})`}
                      />
                    </svg>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* Blank space for long division work - only if NOT showing answer */}
      {!showAnswer && (
        <div className="absolute left-0 right-0 bottom-0 h-32 border-b border-dashed border-gray-300 pointer-events-none"></div>
      )}
    </div>
  );
}
