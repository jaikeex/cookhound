import React from 'react';
import { classNames } from '@/client/utils';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    color: {
        primary: `checked:bg-blue-400 checked:border-blue-400
        checked:dark:bg-blue-600 checked:dark:border-blue-600`,
        secondary: `checked:bg-green-400 checked:border-green-400
        checked:dark:bg-green-600 checked:dark:border-green-600`
    },
    size: {
        input: {
            sm: `w-4 h-4`,
            md: `w-5 h-5`,
            lg: `w-6 h-6`
        },
        dot: {
            sm: `w-2 h-2`,
            md: `w-2.5 h-2.5`,
            lg: `w-3 h-3`
        }
    }
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type RadioProps = Readonly<{
    className?: string;
    color?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
}> &
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>;

export const Radio: React.FC<RadioProps> = ({
    className,
    color = 'primary',
    size = 'md',
    ...props
}) => {
    return (
        <div className={classNames('relative flex gap-2', className)}>
            <input
                {...props}
                type="radio"
                className={classNames(
                    `peer appearance-none rounded-full border-2 cursor-pointer transition duration-150 ease-in-out`,
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'border-gray-700 bg-gray-200 dark:bg-slate-900 dark:border-gray-300',
                    classConfig.color[color],
                    classConfig.size.input[size]
                )}
            />

            {/* Dot indicator */}
            <span
                className={classNames(
                    `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none`,
                    classConfig.size.dot[size]
                )}
            />
        </div>
    );
};
