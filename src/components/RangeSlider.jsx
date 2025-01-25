import React from 'react';
import styled from 'styled-components';
import { Range } from 'react-range';

const RangeContainer = styled.div`
  padding: 1rem 0;
`;

const Track = styled.div`
  height: 6px;
  width: 100%;
  background: ${props => props.theme.sliderTrackBg};
  border-radius: 3px;
  position: relative;
`;

const ActiveTrack = styled.div`
  position: absolute;
  height: 100%;
  background: ${props => props.theme.accent};
  opacity: 0.5;
  top: 0;
  border-radius: 3px;
  transition: all 0.3s ease;
`;

const Thumb = styled.div`
  width: 20px;
  height: 20px;
  background: ${props => props.theme.accent};
  border-radius: 50%;
  box-shadow: 0 0 10px ${props => props.theme.shadowColor};
  cursor: pointer;
`;

const ValueLabel = styled.div`
  color: ${props => props.theme.text};
  font-size: 0.8rem;
  margin-top: 0.5rem;
  text-align: center;
`;

export const RangeSlider = ({ value, onChange, min, max }) => {
    const getPercentage = (value) => ((value - (min || 0)) / ((max || 100) - (min || 0))) * 100;

    return (
        <RangeContainer>
            <Range
                values={value}
                step={1}
                min={min || 0}
                max={max || 100}
                onChange={onChange}
                renderTrack={({ props, children }) => (
                    <Track {...props} ref={props.ref}>
                        <ActiveTrack
                            style={{
                                left: `${getPercentage(value[0])}%`,
                                width: `${getPercentage(value[1]) - getPercentage(value[0])}%`
                            }}
                        />
                        {children}
                    </Track>
                )}
                renderThumb={({ props, index }) => (
                    <Thumb
                        {...props}
                        key={index}
                        ref={props.ref}
                    />
                )}
            />
            <ValueLabel>
                {value[0]} - {value[1]}
            </ValueLabel>
        </RangeContainer>
    );
}; 