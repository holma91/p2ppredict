import styled from 'styled-components';

const Button = styled.button`
    padding: 8px 12px;
    font-size: ${({theme}) => theme.typeScale.paragraph};
    border-radius: 2px;
    min-width: 100px;
    cursor: pointer;
    font-family: ${({theme}) => theme.font.primary};
`;

export const PrimaryButton = styled(Button)`
    background-color: ${({theme}) => theme.colors.primary};
    color: white;
    border: 2px solid transparent;
`;

export const SecondaryButton = styled(Button)`
    background-color: white;
    border: 3px solid ${({theme}) => theme.colors.primary};
    color: ${({theme}) => theme.colors.primary};
    border-radius: 0;
`;

export const TertiaryButton = styled(Button)`
    background-color: white;
    border: 2px solid transparent;
    color: ${({theme}) => theme.colors.primary};
`;
