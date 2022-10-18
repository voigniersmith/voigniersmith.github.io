import { Container, Divider, Typography } from '@material-ui/core';

export default function Contact() {
    return (
        <Container maxWidth='xs'>
            <h2>Contact</h2>
            <Typography>
                Please email me at voigniersmith@gmail.com. 
            </Typography>
            <br />
            <Divider variant="fullwidth" horizontal />
        </Container>
    );
}