import type { Metadata } from "next";
import { LegalHeader, LegalNotice, Prose } from "@/components/legal/legal-doc";
import { LEGAL_ENTITY, CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Condições de uso da plataforma Desenvolva TEA para famílias, profissionais e secretarias municipais de educação.",
  alternates: { canonical: "/termos" },
};

const UPDATED_AT = "2 de junho de 2026";

export default function TermosPage() {
  return (
    <article>
      <LegalHeader title="Termos de Uso" updatedAt={UPDATED_AT} />

      <LegalNotice>
        <strong>Modelo de referência.</strong> Este documento é um ponto de
        partida e deve ser revisado por assessoria jurídica antes da publicação.
        Os campos marcados como <strong>[PREENCHER]</strong> precisam ser
        completados com os dados oficiais da empresa.
      </LegalNotice>

      <Prose>
        <p>
          Estes Termos de Uso (&ldquo;Termos&rdquo;) regulam o acesso e a
          utilização da plataforma {SITE_NAME} (&ldquo;Plataforma&rdquo;),
          disponibilizada pela <strong>{LEGAL_ENTITY}</strong>, inscrita no CNPJ
          nº <strong>[PREENCHER]</strong> (&ldquo;{SITE_NAME}&rdquo;,
          &ldquo;nós&rdquo;). Ao acessar ou utilizar a Plataforma, você
          (&ldquo;Usuário&rdquo;) concorda integralmente com estes Termos. Caso
          não concorde, não utilize a Plataforma.
        </p>

        <h2>1. Objeto</h2>
        <p>
          A Plataforma é uma solução digital destinada ao acompanhamento do
          desenvolvimento educacional e terapêutico de crianças com Transtorno do
          Espectro Autista (TEA), conectando famílias, profissionais e
          secretarias municipais de educação por meio de cadastros, registros de
          evolução, trilhas de aprendizagem, conteúdos e relatórios.
        </p>

        <h2>2. Cadastro e acesso</h2>
        <ul>
          <li>
            O acesso ocorre mediante credenciais individuais e intransferíveis,
            fornecidas conforme o perfil do Usuário (família, profissional,
            prefeitura ou administrador).
          </li>
          <li>
            O Usuário é responsável por manter a confidencialidade de suas
            credenciais e por todas as atividades realizadas em sua conta.
          </li>
          <li>
            O Usuário compromete-se a fornecer informações verdadeiras, exatas e
            atualizadas, responsabilizando-se por elas.
          </li>
        </ul>

        <h2>3. Cadastro de crianças e responsabilidade dos dados</h2>
        <p>
          O Usuário declara possuir autorização e legitimidade para inserir e
          tratar os dados das crianças cadastradas. Os{" "}
          <strong>responsáveis legais</strong> permanecem como titulares e
          gestores dessas informações. É vedado o cadastro de dados sem a devida
          autorização do responsável legal.
        </p>

        <h2>4. Uso permitido</h2>
        <p>O Usuário compromete-se a utilizar a Plataforma de forma ética e legal, sendo vedado:</p>
        <ul>
          <li>
            utilizar a Plataforma para finalidades ilícitas ou diversas das aqui
            previstas;
          </li>
          <li>
            acessar áreas, contas ou dados aos quais não tenha autorização;
          </li>
          <li>
            tentar comprometer a segurança, a integridade ou a disponibilidade da
            Plataforma;
          </li>
          <li>
            reproduzir, distribuir ou explorar comercialmente conteúdos sem
            autorização.
          </li>
        </ul>

        <h2>5. Propriedade intelectual</h2>
        <p>
          A Plataforma, sua marca, identidade visual, código, layout e conteúdos
          próprios são protegidos por direitos de propriedade intelectual e
          pertencem à {SITE_NAME} ou a seus licenciadores. O uso da Plataforma não
          transfere ao Usuário qualquer direito sobre tais ativos. Os dados e
          conteúdos inseridos pelo Usuário permanecem de sua titularidade ou de
          quem ele representa.
        </p>

        <h2>6. Privacidade e proteção de dados</h2>
        <p>
          O tratamento de dados pessoais observa a nossa{" "}
          <a href="/privacidade">Política de Privacidade</a> e a Lei Geral de
          Proteção de Dados (LGPD — Lei nº 13.709/2018), parte integrante destes
          Termos.
        </p>

        <h2>7. Disponibilidade e suporte</h2>
        <p>
          Empregamos esforços razoáveis para manter a Plataforma disponível e
          segura, mas não garantimos funcionamento ininterrupto ou livre de
          falhas. Poderão ocorrer interrupções para manutenção, atualizações ou
          por fatores fora de nosso controle.
        </p>

        <h2>8. Limitação de responsabilidade</h2>
        <p>
          A Plataforma é uma ferramenta de apoio ao acompanhamento e{" "}
          <strong>não substitui</strong> avaliação, diagnóstico ou tratamento
          realizado por profissionais de saúde e educação habilitados. As
          decisões clínicas, terapêuticas e educacionais são de responsabilidade
          dos respectivos profissionais e responsáveis. Na máxima extensão
          permitida pela lei, a {SITE_NAME} não se responsabiliza por decisões
          tomadas com base nas informações da Plataforma.
        </p>

        <h2>9. Suspensão e encerramento</h2>
        <p>
          Podemos suspender ou encerrar o acesso de Usuários que violem estes
          Termos ou a legislação aplicável, sem prejuízo das medidas cabíveis.
        </p>

        <h2>10. Alterações dos Termos</h2>
        <p>
          A {SITE_NAME} poderá revisar e atualizar estes Termos de Uso
          periodicamente, notificando os usuários quando aplicável. O uso
          continuado da Plataforma após a vigência das alterações representa a
          concordância com os novos Termos.
        </p>

        <h2>11. Legislação e foro</h2>
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil.
          Fica eleito o foro da comarca de <strong>[PREENCHER]</strong> para
          dirimir quaisquer controvérsias, com renúncia a qualquer outro, por
          mais privilegiado que seja.
        </p>

        <h2>12. Contato</h2>
        <p>
          Dúvidas sobre estes Termos podem ser encaminhadas para{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </Prose>
    </article>
  );
}
