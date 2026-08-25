import type { Metadata } from "next";
import { LegalHeader, LegalNotice, Prose } from "@/components/legal/legal-doc";
import { LEGAL_ENTITY, CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Desenvolva TEA coleta, utiliza, armazena e protege os dados pessoais, em conformidade com a LGPD (Lei nº 13.709/2018).",
  alternates: { canonical: "/privacidade" },
};

const UPDATED_AT = "2 de junho de 2026";

export default function PrivacidadePage() {
  return (
    <article>
      <LegalHeader title="Política de Privacidade" updatedAt={UPDATED_AT} />

      <LegalNotice>
        <strong>Modelo de referência.</strong> Este documento é um ponto de
        partida e deve ser revisado por assessoria jurídica antes da publicação.
        Os campos marcados como <strong>[PREENCHER]</strong> precisam ser
        completados com os dados oficiais da empresa.
      </LegalNotice>

      <Prose>
        <p>
          Esta Política de Privacidade descreve como a{" "}
          <strong>{LEGAL_ENTITY}</strong>, inscrita no CNPJ nº{" "}
          <strong>[PREENCHER]</strong>, com sede em <strong>[PREENCHER]</strong>{" "}
          (&ldquo;{SITE_NAME}&rdquo;, &ldquo;nós&rdquo;), na qualidade de{" "}
          <strong>controladora dos dados</strong>, coleta, utiliza, armazena,
          compartilha e protege os dados pessoais tratados por meio da
          plataforma {SITE_NAME} (&ldquo;Plataforma&rdquo;), em conformidade com
          a Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018) e
          demais normas aplicáveis.
        </p>
        <p>
          Ao utilizar a Plataforma, você declara estar ciente das práticas
          descritas neste documento.
        </p>

        <h2>1. A quem esta política se aplica</h2>
        <p>
          A Plataforma realiza o tratamento de dados pessoais de{" "}
          <strong>responsáveis legais</strong>, <strong>profissionais</strong>{" "}
          (terapeutas, educadores e equipes técnicas) e{" "}
          <strong>crianças cadastradas</strong>, para fins de acompanhamento
          educacional e terapêutico relacionados ao Transtorno do Espectro
          Autista (TEA).
        </p>
        <p>
          Os responsáveis legais permanecem como titulares e gestores das
          informações fornecidas sobre as crianças cadastradas, sendo
          responsáveis por garantir a veracidade e a autorização para o
          fornecimento desses dados.
        </p>

        <h2>2. Dados que coletamos</h2>
        <p>
          A Plataforma poderá coletar e tratar as seguintes categorias de dados,
          conforme necessário ao funcionamento dos serviços:
        </p>
        <ul>
          <li>
            <strong>Dados cadastrais:</strong> nome, e-mail, perfil de acesso
            (família, profissional, prefeitura ou administrador) e organização
            vinculada.
          </li>
          <li>
            <strong>Dados das crianças:</strong> nome, data de nascimento, nível
            de suporte, responsáveis vinculados e demais informações de perfil.
          </li>
          <li>
            <strong>Dados de acompanhamento:</strong> registros de evolução,
            histórico de atividades, progresso em trilhas, relatórios e
            anotações inseridas pelos usuários.
          </li>
          <li>
            <strong>Dados de utilização:</strong> registros de acesso, logs de
            autenticação e informações técnicas necessárias à segurança e ao
            funcionamento da Plataforma.
          </li>
        </ul>
        <p>
          Determinados dados tratados podem ser considerados{" "}
          <strong>dados pessoais sensíveis</strong> (referentes à saúde e a
          crianças), recebendo proteção reforçada e tratamento restrito às
          finalidades aqui descritas.
        </p>

        <h2>3. Finalidades do tratamento</h2>
        <p>
          Os dados são utilizados <strong>exclusivamente</strong> para a
          prestação dos serviços oferecidos pela Plataforma, incluindo:
        </p>
        <ul>
          <li>
            permitir o acompanhamento do desenvolvimento educacional e
            terapêutico das crianças;
          </li>
          <li>
            gerar registros de evolução, trilhas de aprendizagem e relatórios;
          </li>
          <li>
            disponibilizar indicadores e relatórios consolidados a gestores e
            secretarias municipais de educação, quando aplicável;
          </li>
          <li>
            autenticar usuários, garantir a segurança e prevenir fraudes e usos
            indevidos;
          </li>
          <li>cumprir obrigações legais e regulatórias.</li>
        </ul>

        <h2>4. Bases legais</h2>
        <p>
          O tratamento de dados observa as bases legais previstas na LGPD,
          notadamente: execução de contrato e procedimentos preliminares,
          cumprimento de obrigação legal, legítimo interesse e, quando exigido,{" "}
          <strong>consentimento</strong> do titular ou de seu responsável legal,
          especialmente em relação a dados de crianças e adolescentes, sempre no
          melhor interesse da criança (art. 14 da LGPD).
        </p>

        <h2>5. Armazenamento e segurança</h2>
        <p>
          Os dados são armazenados em ambiente seguro e utilizados exclusivamente
          para a prestação dos serviços. Adotamos medidas técnicas e
          administrativas razoáveis para proteger os dados pessoais contra
          acessos não autorizados, perda, alteração ou divulgação indevida,
          incluindo controle de acesso por perfil, autenticação por sessão e
          segregação de dados por organização (multi-tenant).
        </p>

        <h2>6. Compartilhamento de dados</h2>
        <p>
          Não comercializamos dados pessoais. O compartilhamento ocorre apenas
          quando necessário às finalidades descritas, por exemplo com:
        </p>
        <ul>
          <li>
            profissionais e organizações vinculados ao acompanhamento da
            criança;
          </li>
          <li>
            secretarias municipais de educação, por meio de indicadores e
            relatórios, conforme o perfil de acesso;
          </li>
          <li>
            operadores e prestadores de serviço de tecnologia (ex.: hospedagem),
            estritamente para viabilizar a operação da Plataforma;
          </li>
          <li>autoridades, quando exigido por lei ou ordem judicial.</li>
        </ul>

        <h2>7. Retenção e eliminação</h2>
        <p>
          Os dados são mantidos pelo período necessário ao cumprimento das
          finalidades de tratamento e das obrigações legais aplicáveis. Encerrado
          esse período, os dados são eliminados ou anonimizados, salvo hipóteses
          de guarda autorizadas pela legislação.
        </p>

        <h2>8. Direitos do titular</h2>
        <p>
          Nos termos do art. 18 da LGPD, o titular (ou seu responsável legal)
          pode, a qualquer momento, solicitar:
        </p>
        <ul>
          <li>confirmação da existência de tratamento;</li>
          <li>acesso aos dados;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>
            anonimização, bloqueio ou eliminação de dados desnecessários ou
            tratados em desconformidade com a lei;
          </li>
          <li>portabilidade dos dados;</li>
          <li>
            informação sobre compartilhamento e revogação do consentimento.
          </li>
        </ul>
        <p>
          As solicitações podem ser feitas pelo e-mail{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>9. Cookies</h2>
        <p>
          A Plataforma utiliza cookies essenciais para autenticação e
          funcionamento da sessão do usuário. Esses cookies são necessários e não
          são utilizados para fins publicitários.
        </p>

        <h2>10. Encarregado pelo tratamento de dados (DPO)</h2>
        <p>
          Para exercer seus direitos ou esclarecer dúvidas sobre esta Política,
          entre em contato com o nosso encarregado de proteção de dados:
        </p>
        <ul>
          <li>
            <strong>Controladora:</strong> {LEGAL_ENTITY}
          </li>
          <li>
            <strong>E-mail:</strong>{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </li>
          <li>
            <strong>Encarregado (DPO):</strong> [PREENCHER]
          </li>
        </ul>

        <h2>11. Alterações desta Política</h2>
        <p>
          A {SITE_NAME} poderá revisar e atualizar esta Política de Privacidade
          periodicamente, notificando os usuários quando aplicável. Recomendamos
          a consulta regular a este documento. A data da última atualização está
          indicada no topo desta página.
        </p>
      </Prose>
    </article>
  );
}
