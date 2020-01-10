import React from 'react';
import styled from 'styled-components';

import responsive from '../../AtMedia/index';

/**
 * display: flex;
        flex-direction: column;
        justify-content: flex-end;
 */
const HiddenNavStyled = styled.div`
        width: 100vw;
        height: inherit;
        position: absolute;
        z-index: 1;
        left: 0; top: 0;
        text-align: center;
`;

const setBottom = () => {
    const h = window.innerHeight;
    return h / 2 + 'px';
}

const BoardContainer = styled.div`
    margin: 0 auto;
    padding: 0;

    width: 50vw;
    height: 50vw;
    

    width: 60vh;
    height: 60vh;

    perspective: 70vh;
    transform: rotateZ(4deg);


    position: relative;
    width: 60vh;
    height: 47vh;
    top: -11vh;
    left: -1px;
    ${responsive('orientation').portrait`
        ${responsive('max-height').navH`
            ${responsive('max-width').navW`
                width: 100vw;
                height: 58vw;
                top: -11vw;
                perspective: 70vw;
            `}
        `}
    `}
`;


/**
 * position: relative;
    left: 0;
    top: 0;


    ${responsive('max-width').narrow`
        max-width: 250px;
        max-height: 250px;
    `}
    ${responsive('max-width').veryNarrow`
        max-width: 200px;
        max-height: 200px;
    `}


    -webkit-transform: rotateX(58deg) rotateZ(-52deg);
    -ms-transform: rotateX(58deg) rotateZ(-52deg);
    -webkit-transform: rotateX(43deg) rotateZ(-46deg);
    -ms-transform: rotateX(43deg) rotateZ(-46deg);
    -webkit-transform: rotateX(44deg) rotateZ(-45deg);
    -ms-transform: rotateX(44deg) rotateZ(-45deg);
    transform: rotateX(44deg) rotateZ(-45deg);
 */

const Board = styled.div`
    opacity: 0;
    background: red;
    z-index: 1;

    margin: 0 auto;
    padding: 0;

    width: 50vw;
    height: 50vw;


    width: 54vh;
    height: 55vh;
    

    transform: rotate3d(5,1,-2,61deg) rotateZ(-23deg) rotateX(1deg) rotateY(-5deg);
    ${responsive('orientation').portrait`
        ${responsive('max-height').navH`
            ${responsive('max-width').navW`
                width: 54vw;
                height: 55vw;
            `}
        `}
    `}
`;

// landscape: w: winH, h: winH / 2
// portrait: w: winW, h: winW / 2

// width: (100vw)
// height: 50vw;
// portrait: max-height: 300px;
// landscape: max-height: 50vh;

const HiddenNav = props => {
    return (
        <HiddenNavStyled className='HiddenNav'>
            <BoardContainer className="BoardContainer">
                <Board className='Board'>
                    {props.children}
                </Board>
            </BoardContainer>
        </HiddenNavStyled>
    );
}

export default HiddenNav;