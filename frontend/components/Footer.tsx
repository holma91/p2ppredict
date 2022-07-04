import styled from 'styled-components';

const Footer = () => {
  return (
    <FooterContainer>
      <FooterText>
        a MVP for a tokenized options protocol, created for the chainlink 2022
        hackathon
      </FooterText>
    </FooterContainer>
  );
};

const FooterContainer = styled.div`
  border-top: 1px solid #ecedef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
`;

const FooterText = styled.span`
  font-size: 12px;
  font-weight: 300;
`;

export default Footer;