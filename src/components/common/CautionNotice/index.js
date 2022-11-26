import { Button, Checkbox, Modal } from "antd";
import React, { useState } from "react";
import "./index.scss";

const TermsModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(
    localStorage.getItem("agreement_accepted") === null
  );

  const [isChecked, setIsChecked] = useState(false);

  const handleOk = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        title="Terms and Conditions"
        className="terms-modal"
        closeIcon={false}
        footer={false}
        width={800}
        centered
        open={isModalOpen}
        onOk={handleOk}
      >
        <div className="pdf-view">
          <h4 className="mb-0 text-center">cSwap Terms of Use</h4>
          <p className="text-center">Date Last Revised: [21 Nov 2022]</p>
          <p>
            Please review these Terms of Use of cSwap (the <b>“Terms”</b>)
            carefully, as they set forth legally binding terms and conditions
            between you and the Company that govern your access and/or use of
            (a) the website located at https://cswap.one/ (the <b>“Website”</b>
            ); (b) the cSwap Smart Contracts (as defined below); and (c) the
            Comdex Chain (as defined below) on which the cSwap Smart Contracts
            (as defined below) are deployed, including related trademarks, and
            other intellectual property, whether such access and/or use is via
            (i) the Website <b>(“Website Access”)</b> or (ii) command line,
            locally installed programs, Software Development Kits (“SDK”),
            software code and blockchain and smart contract explorers
            (collectively
            <b>“Direct Access”</b>)
          </p>
          <p>
            For purposes of these Terms, the Website, the cSwap Smart Contracts
            (as defined below) and Comdex Chain (as defined below) shall be
            collectively referred to as <b>“cSwap”</b>.
          </p>
          <p>
            By accessing and/or using cSwap, you (<b>“you”</b> or the{" "}
            <b>“User”</b>) agree to these Terms on behalf of yourself and any
            entity you represent, and you represent and warrant that you have
            the right and authority to do so.
          </p>
          <div className="border-box">
            <p>
              cSwap (which includes the Website, the cSwap Smart Contracts (as
              defined below) and Comdex Chain (as defined below)) are not
              intended for (a) access and/or use by Excluded Persons (as defined
              below); or (b) access and/or use by any person or entity in, or
              accessing or using the Website from, an Excluded Jurisdiction.
            </p>
            <p>
              Accordingly, Excluded Persons (as defined below) should not access
              and/or use cSwap (which includes the Website, the cSwap Smart
              Contracts (as defined below) and Comdex Chain (as defined below)).
            </p>
          </div>
          <p>
            The Website is owned and operated by Comdex Business Ventures Ltd (
            <b>“Company”</b>), an entity formed under the laws of the British
            Virgin Islands and the cSwap Smart Contracts (as defined below) are
            copyrighted works belonging to the Company and/or its Affiliate(s)
            (each of User and Company, a<b>“Party”</b>, and collectively, the{" "}
            <b>“Parties”</b>).
          </p>
          <p>
            You acknowledge that you shall be deemed to have accepted these
            Terms by accessing and/or using cSwap – whether by Website Access or
            Direct Access.
          </p>
          <p>
            <b>
              Company reserves the right to change these Terms in its sole
              discretion from time to time. The “Date Last Revised” specified on
              these Terms indicates the date on which the Terms were last
              changed. You will be notified of those changes and given the
              opportunity to review and accept the updated Terms when you next
              access and/or use cSwap. Your acceptance of, and/or your continued
              access and/or use of cSwap following notice of, the updated Terms
              shall indicate your acknowledgement of and agreement to be bound
              by such the updated Terms.
            </b>
          </p>

          <h5>1. Overview of cSwap</h5>

          <ol type="1">
            <li>
              1{" "}
              <i>
                <b>cSwap</b>
              </i>{" "}
              has been developed by Company to enable Users to undertake any one
              or more of the following (<b>“cSwap Activities”</b>) :
              <ol type="a">
                <li className="m-4">
                  effect Token Swaps (as defined below) of digital assets
                  supported by cSwap (<b>“cSwap Supported Tokens”</b>) on the
                  Comdex Chain (as defined below) and across other IBC-enabled
                  blockchains (<b>“cSwap Supported Blockchains”</b>) on a
                  non-custodial basis, in accordance with the procedures for the{" "}
                  <i>
                    <b>“Trade”</b>
                  </i>{" "}
                  feature of cSwap further described at Section 2.1;
                </li>
                <li>
                  provide liquidity (“Liquidity Provision”) in respect of cSwap
                  Supported Token pairs (“Liquidity Token Pairs”) by way of :
                  <ol>
                    <li typeof="i">
                      transfer of such Liquidity Token Pair to a cSwap Supported
                      Blockchain address associated with a liquidity pool smart
                      contract (“Liquidity Pool”) which is a part of the cSwap
                      Smart Contracts (as defined below) designated for
                      non-custodial holding of cSwap Supported Token pairs of
                      the same type as Liquidity Token Pair) as liquidity for
                      and with a view to facilitating other Users’ Token Swaps
                      of the same type as the Liquidity Token Pair.
                      Alternatively, User may create a Liquidity Pool with the
                      desired cSwap Supported Token pair, subject to a Liquidity
                      Pool Creation Fee (as defined below); and
                    </li>
                    <li>
                      in return, receive Liquidity Pool tokens (“LP Tokens”)
                      representing the proportion of overall liquidity
                      contributed by User in the respective Liquidity Pool,
                      which LP Tokens may be deposited in smart contract
                      address(es) designated by cSwap in order to receive
                      rewards in connection with User’s Liquidity Provision
                      (“Liquidity Farming”), in accordance with the “Farm”
                      feature further described at Section 2.2; and
                    </li>
                  </ol>
                </li>
                <li>
                  participate in and vote on governance matters (“Governance”)
                  (“Governance Voting”) relating to the future development of
                  cSwap, including operational parameters for the cSwap Smart
                  Contracts from time to time, by Staking User’s CMDX Tokens (as
                  defined below) in order to obtain Governance rights, in
                  accordance with the “Govern” feature further described at
                  Section 2.3.
                </li>
              </ol>
            </li>
            <li>
              cSwap enables Users to undertake cSwap Activities through the use
              of smart contracts comprising computer code written based on
              various blockchain standard and programming languages
              (collectively, “cSwap Smart Contracts”) developed and published by
              [Company or its Affiliate(s) (as defined below)] at Github at{" "}
              <a href="https://github.com/comdex-official/comdex">
                https://github.com/comdex-official/comdex
              </a>{" "}
              (“Github Page”).
            </li>
            <li>
              <p>For purposes of these Terms</p>
              <ol type="a">
                <li>
                  “Affiliates” of an entity means the owners, directors,
                  officers, employees, advisors, agents of such entity and
                  companies in which such entity has an interest;
                </li>
                <li>
                  “CMDX Tokens” or “CMDX” means the fungible cryptographic
                  tokens native to the Comdex Chain;
                </li>
                <li>
                  “Comdex Chain” means the blockchain known as Comdex developed
                  based on the Cosmos SDK;
                </li>
                <li>
                  “cSwap Documentation” means the document repository on cSwap
                  accessible at https://docs.cswap.one/, including the Token
                  Swap Tutorial (as defined below), Liquidity Tutorial (as
                  defined below), Governance Tutorial (as defined below) and
                  Frequently-Asked-Questions (“FAQs”) on cSwap accessible at
                  https://docs.cswap.one/faq;
                </li>
                <li>
                  “IBC” means the Inter-Blockchain Communication Protocol;
                </li>
                <li>
                  “Liquidity Pool Creation Fee” has the meaning ascribed to it
                  in the cSwap Documentation;
                </li>
                <li>
                  “Stake” involves a transfer of CMDX Tokens to a cSwap
                  Supported Blockchain address associated with a smart contract
                  (which is a part of the cSwap Smart Contracts designated by
                  cSwap), and thereafter not transferring such CMDX Tokens from
                  such designated address for a period of time stipulated by
                  Company and/or its Affiliate(s), and “Staked” and “Staking”
                  shall be construed accordingly;
                </li>
                <li>
                  “Swap Fees” has the meaning ascribed to it in the cSwap
                  Documentation; and
                </li>
                <li>
                  “Token Swap” in relation to a cSwap Supported Token (“Quote
                  Token”) compatible with a cSwap Supported Blockchain (“Quote
                  Token Chain”) that the User intends to swap for another cSwap
                  Supported Token (“Base Token”) compatible with any cSwap
                  Supported Blockchain (“Base Token Chain”) selected by such
                  User, means:
                  <ol type="1">
                    <li>
                      the deposit of Quote Token by such User from a Quote Token
                      Chain-compatible address designated by such User
                      (“User-Designated Quote Token Address”) to a Quote Token
                      Chain-compatible address associated with cSwap Smart
                      Contracts for deposit of cSwap Supported Tokens of the
                      same type as Quote Token; and
                    </li>
                    <li>
                      the deposit by cSwap Smart Contracts of Base Token to a
                      Base Token Chain-compatible address designated by such
                      User, in the following manner:
                      <ol type="a">
                        <li>
                          in the case where Base Token is compatible with the
                          Quote Token Chain, Base Token shall be deposited to
                          the User-Designated Quote Token Address; or
                        </li>
                        <li>
                          in the case where Base Token is compatible with such
                          other cSwap Supported Blockchain, Base Token shall be
                          deposited to a Base Token Chain-compatible address
                          associated with the cSwap Smart Contracts for deposit
                          of cSwap Supported Tokens of the same type as Base
                          Token, which Base Token may then be withdrawn by such
                          User by selecting the “Withdraw” button next to the
                          Base Token listed under the “Assets” tab on the
                          Website, upon which Base Token shall (subject to any
                          applicable transaction fees) be deposited to a Base
                          Token Chain-compatible address designated by such
                          User.
                        </li>
                      </ol>
                    </li>
                  </ol>
                </li>
              </ol>
            </li>
            <li>
              <p>
                <u>Website Access.</u>
              </p>
              <ol type="a">
                <li>
                  The Website is a user interface designed by Company to
                  facilitate use of the cSwap Smart Contract deployed on the
                  Comdex Chain by providing a user-friendly interface to access
                  / use the cSwap Smart Contracts and the Comdex Chain although
                  the cSwap Smart Contracts are also accessible / can be used
                  via Direct Access. Company may modify or discontinue support
                  for the Website at any time, in its sole discretion
                </li>
                <li>
                  You are hereby granted a non-exclusive, non-transferable,
                  revocable, limited licence to electronically access and use
                  the Website in the manner described in these Terms. You do not
                  have the right, and nothing in these Terms shall be construed
                  as granting you the right, to sub-license any rights in
                  connection with the access and/or use of the Website. Company
                  may revoke or terminate this licence at any time if you use,
                  or attempt to use, the Website in a manner prohibited by these
                  Terms, or if your rights under these Terms are terminated
                  pursuant to Section 6.
                </li>
                <li>
                  The Website allows a User to read and display data associated
                  with any cSwap Supported Blockchain-compatible wallet address
                  for which that User controls the associated private key and
                  uses to interact with the cSwap Smart Contracts by generating
                  standardised transaction messages in order to undertake a
                  cSwap Activity and/or cSwap Transaction using cSwap –
                  including providing a dashboard displaying a User’s cSwap
                  Supported Tokens in such User’s cSwap Supported
                  Blockchain-compatible address that is connected to the cSwap
                  Smart Contracts as well as the cSwap Supported Tokens
                  deposited by such User and other User(s) in cSwap Supported
                  Blockchain-compatible addresses associated with cSwap Smart
                  Contracts.
                </li>
                <li>
                  In order to access and/or use cSwap via the Website, a User
                  must first connect a cSwap Supported Blockchain-compatible
                  wallet to the cSwap Smart Contracts.
                </li>
              </ol>
            </li>
            <li>
              Direct Access. With the necessary technical expertise, it is
              possible for a User to generate transaction messages to interact
              with the cSwap Smart Contracts via Direct Access directly without
              use of the Website.{" "}
              <span className="text-dagner">
                Company is not involved in and has no oversight of any Direct
                Access and expressly disclaims all responsibility, and User
                acknowledges that Company and its Affiliates shall have no
                responsibility for any loss occasioned to a User by or
                attributable to Direct Access.
              </span>
            </li>
            <li>
              <p>
                <u>cSwap Smart Contract</u>
              </p>
              <ol type="a">
                <li>
                  Company has led the development of and has deployed
                  (“Deployment”) the cSwap Smart Contracts on the Comdex Chain.
                </li>
                <li>
                  Apart from Website Access and Direct Access, the cSwap Smart
                  Contracts may also be accessible now or in the future through
                  other applications built on the Comdex Chain. On Deployment,
                  the cSwap Smart Contracts hold no digital assets.
                </li>
                <li>
                  The cSwap Smart Contracts are open-source software accessible
                  at the Github Page, and are maintained and modifiable by the
                  Company (and/or its Affiliates). You agree that save for the
                  right to access and/or use the cSwap Smart Contracts on the
                  terms expressly provided herein, you shall not acquire and/or
                  own any legal right, title and/or interest in the cSwap Smart
                  Contracts or any intellectual property rights associated
                  thereto, which shall be wholly owned by the Company (and/or
                  its Affiliates).
                </li>
              </ol>
            </li>
            <li>
              <p>
                <u>Transaction Fees.</u>
              </p>
              <ol type="a">
                <li>
                  A transaction fee (“Transaction Fee”) shall be chargeable to a
                  User for each cSwap-related transaction (“cSwap Transaction”)
                  – whether Token Swap, Liquidity Provision or Staking in order
                  to obtain Governance rights – executed through the cSwap Smart
                  Contracts. Such Transaction Fees are separate and distinct
                  from fees payable for the execution of specific cSwap
                  Transactions, if any (including Swap Fees and Liquidity Pool
                  Creation Fees, as referred to in the cSwap Documentation)
                </li>
                <li>
                  The Transaction Fee for a specific cSwap Transaction will be
                  displayed to Users of the Website during the initiation of
                  such cSwap Transaction and must be accepted by a User before
                  executing such cSwap Transaction.
                </li>
                <li>
                  A User hereby consents to such fees being debited from such
                  User’s cSwap Supported Blockchain-compatible wallet that such
                  User connects to the cSwap Smart Contracts for purposes of
                  effecting a cSwap Transaction, at the time such cSwap
                  Transaction is processed. Similar transaction fees may also be
                  levied on Users accessing and using the cSwap Smart Contracts
                  via Direct Access.
                </li>
                <li>
                  Such Transaction Fees may be subject of variation through
                  on-chain Governance with such variation implemented by Company
                  via variations to the cSwap Smart Contracts.
                </li>
              </ol>
            </li>
          </ol>
          <h5>2 Using cSwap</h5>
          <ol type="1">
            <li>
              <p>
                <u>Token Swaps:</u>
              </p>
              <ol>
                <li>
                  Token Swaps may be effected via the “Trade” feature accessible
                  through the Website or Direct Access. The process for
                  effecting Token Swaps is illustrated in a tutorial under the
                  tab entitled “How to use cSwap” at
                  https://docs.cswap.one/trade-swap (“Token Swap Tutorial”), as
                  supplemented by the FAQs.
                </li>
                <li>
                  A User accessing and/or using cSwap to effect Token Swaps is
                  deemed to have read and understood the cSwap Documentation,
                  and acknowledges and accepts all risks and fees relating to
                  Token Swaps as set out in the cSwap Documentation, in
                  particular that Transaction Fees and Swap Fees are chargeable
                  in respect of Token Swaps.
                </li>
              </ol>
            </li>
            <li>
              <p>
                <u>Liquidity Provision & Farming:</u>
              </p>
              <ol type="a">
                <li>
                  User may effect Liquidity Provision in respect of cSwap
                  Supported Token pairs (being Liquidity Token Pairs) and earn
                  rewards in respect of such Liquidity Provision via Liquidity
                  Farming through the “Farm” feature accessible via Website
                  Access or Direct Access. The processes for Liquidity Provision
                  and Liquidity Farming (“Liquidity Provision & Farming”) are
                  illustrated in a tutorial accessible at
                  https://docs.cswap.one/add-liquidity (“Liquidity Tutorial”) as
                  supplemented by the FAQs.
                </li>
                <li>
                  A User accessing and/or using cSwap for Liquidity Provision
                  and/or Liquidity Farming is deemed to have read and understood
                  the cSwap Documentation, and acknowledges and accepts all
                  risks and fees relating to Liquidity Provision and/or
                  Liquidity Farming as set out in the cSwap Documentation, in
                  particular :
                  <ol type="i">
                    <li>
                      that Transaction Fees are chargeable in respect of
                      Liquidity Provision, Liquidity Farming, withdrawal of LP
                      Tokens, withdrawal of Liquidity Token Pairs; and
                    </li>
                    <li className="taxt-danger">
                      that Company and its Affiliates shall have no
                      responsibility for any loss occasioned to such User who
                      shall have no claim against Company and its Affiliates in
                      respect thereof.
                    </li>
                  </ol>
                </li>
                <li>
                  A User (“Liquidity User”) who has effected Liquidity Provision
                  & Farming:
                  <ol>
                    <li>
                      will be remunerated by a User effecting a Token Swap
                      (“Token Swap User”) that draws on the Liquidity Token
                      Pairs subject of such Liquidity Provision & Farming by way
                      of an automated cSwap Smart Contracts-initiated sharing of
                      transaction fees (including Swap Fees paid by Token Swap
                      User when effecting a Token Swap) with Liquidity User; and
                    </li>
                    <li>
                      will also receive rewards (“Farming Rewards”) determined
                      by the type of Liquidity Pool(s) in which such Liquidity
                      User has effected Liquidity Provision & Farming, where:
                      <ol type="1">
                        <li>
                          Liquidity Provision & Farming in both Master Pool(s)
                          and Child Pool(s) will yield both External Rewards and
                          Internal Rewards;
                        </li>
                        <li>
                          Liquidity Provision & Farming in Master Pool(s) and
                          not Child Pool(s) will yield only External Rewards;
                          and
                        </li>
                        <li>
                          Liquidity Provision & Farming in only Child Pool(s)
                          and not Master Pool(s) will yield only Internal
                          Rewards.{" "}
                        </li>
                      </ol>
                      <p>For purposes of these Terms:</p>
                      <ol type="1">
                        <li>
                          “Master Pool” and “Child Pool” have the respective
                          meanings ascribed to each of them in the cSwap
                          Documentation;
                        </li>
                        <li>
                          “External Rewards” means rewards for Liquidity
                          Provision & Farming in the form of digital assets
                          compatible with IBC-enabled blockchains which are not
                          native to the Comdex Chain; and
                        </li>
                        <li>
                          Internal Rewards” means rewards for Liquidity
                          Provision & Farming in the form of digital assets
                          native to the Comdex Chain; and
                        </li>
                      </ol>
                    </li>
                  </ol>
                </li>
                <li>
                  The processes for accrual and distribution of a Liquidity
                  User’s Farming Rewards are as set out in the cSwap
                  Documentation, including under the tab entitled “Farming
                  Rewards” at{" "}
                  <a href="https://docs.cswap.one/farming-rewards">
                    https://docs.cswap.one/farming-rewards
                  </a>
                  .
                </li>
              </ol>
            </li>
            <li>
              <p>
                <u>Governance:</u>
              </p>
              <ol type="a">
                <li>
                  A User holding CMDX Tokens may participate in Governance
                  matters relating to the future development of cSwap via the
                  “Govern” feature accessible through the Website or Direct
                  Access. The process for effecting participation in Governance
                  is illustrated in a tutorial under the tab entitled “How to
                  use cSwap” at https://docs.cswap.one/governance (“Governance
                  Tutorial”), as supplemented by Question 9 of the FAQs.
                </li>
                <li>
                  A User accessing and/or using cSwap for Governance Voting is
                  deemed to have read and understood the cSwap Documentation,
                  and acknowledges and accepts all risks and fees relating to
                  Governance Voting as set out in the cSwap Documentation, in
                  particular that transaction fees are chargeable in respect of
                  Staking and Governance Voting.
                </li>
              </ol>
            </li>
          </ol>
          <h5>Representations & Warrantie</h5>
          <ol type="1">
            <li>
              <p>
                You make the following representations and warranties regarding
                your access and/or use of cSwap:
              </p>
              <ol type="a">
                <li>
                  THAT you are legally permitted to access and/or use cSwap in
                  your jurisdiction and your access and/or use of cSwap is in
                  compliance with the laws of your jurisdiction, and you
                  acknowledge that Company is not liable for your compliance or
                  non-compliance with any such laws;
                </li>
                <li>
                  THAT your agreement to these Terms and your access and/or use
                  of cSwap does not constitute, and that you do not expect it to
                  result in, a breach, default, or violation of any applicable
                  law or any contract or agreement to which you are a party or
                  are otherwise bound;
                </li>
                <li>
                  THAT you are not an Excluded Person and are not in an Excluded
                  Jurisdiction, and are not accessing or using cSwap from an
                  Excluded Jurisdiction and for purposes hereof :
                  <ol type="i">
                    <li>
                      “Excluded Jurisdiction” means any of the following
                      jurisdictions : (1) the United States of America and its
                      territories and possessions (collectively, the “United
                      States”); (2) the Republic of India; (3) United Arab
                      Emirates; (4) the Republic of Singapore; (5) a
                      jurisdiction identified by the Financial Action Task Force
                      (FATF) for strategic AML/CFT deficiencies and included in
                      FATF’s listing of “High-risk and Other Monitored
                      Jurisdictions” accessible at
                      https://www.fatf-gafi.org/publications/high-risk-and-other-monitored-jurisdictions/d
                      ocuments/increased-monitoring-october-2022.html or
                      “Jurisdictions Subject to a Call for Action” accessible at
                      https://www.fatf-gafi.org/publications/high-risk-and-other-monitored-jurisdictions/d
                      ocuments/call-for-action-october-2022.html and/or (6) a
                      jurisdiction in which cSwap would be subject of licensing;
                      and
                    </li>
                    <li>
                      “Excluded Persons” refers to the following person(s) : (1)
                      a person who is a citizen, domiciled in, resident of, or
                      physically present / located in an Excluded Jurisdiction;
                      (2) a body corporate: (a) which is incorporated in, or
                      operates out of, an Excluded Jurisdiction, or (b) which is
                      under the control of one or more individuals who is/are
                      citizen(s) of, domiciled in, residents of, or physically
                      present / located in, an Excluded Jurisdiction; (3) an
                      individual or body corporate included in United Nations
                      Consolidated List (accessible at
                      https://www.un.org/securitycouncil/content/un-sc-consolidated-list);
                      (4) an individual or body corporate which is otherwise
                      prohibited or ineligible in any way, whether in full or in
                      part, under any laws applicable to such individual or body
                      corporate from accessing and/or using cSwap; and/or (5) a
                      U.S. person.
                      <p>For purposes of these Terms, a “U.S. person” means:</p>
                      <ol type="A">
                        <li>
                          any natural person resident in the United States
                        </li>
                        <li>
                          any partnership or corporation organised or
                          incorporated under the laws of the United States;
                        </li>
                        <li>
                          any estate of which any executor or administrator is a
                          U.S. person;
                        </li>
                        <li>
                          any trust of which any trustee is a U.S. person;
                        </li>
                        <li>
                          any agency or branch of a foreign entity located in
                          the United States;
                        </li>
                        <li>
                          any non-discretionary account or similar account
                          (other than an estate or trust) held by a dealer or
                          other fiduciary for the benefit or account of a U.S.
                          person;
                        </li>
                        <li>
                          any discretionary account or similar account (other
                          than an estate or trust) held by a dealer or other
                          fiduciary organised, incorporated, or (if an
                          individual) resident in the United States;
                        </li>
                        <li>
                          any partnership or corporation if:
                          <ol type="i">
                            <li>
                              organised or incorporated under the laws of any
                              foreign jurisdiction; and
                            </li>
                            <li>
                              formed by a U.S. person principally for the
                              purpose of investing in securities not registered
                              under the Securities Act of 1933 of the United
                              States of America, unless it is organised or
                              incorporated, and owned, by accredited investors
                              (as defined in Regulation D of that Act) who are
                              not natural persons, estates or trusts; and
                            </li>
                          </ol>
                        </li>
                        <li>
                          any citizen of United States who is a military
                          personnel of United States who is not resident in or
                          outside of the United States,
                          <p>but does not include :</p>
                        </li>
                        <li>
                          any discretionary account or similar account (other
                          than an estate or trust) held for the benefit or
                          account of a non-U.S. person by a dealer or other
                          professional fiduciary organized, incorporated, or (if
                          an individual) resident in the United States;
                        </li>
                        <li>
                          any estate of which any professional fiduciary acting
                          as executor or administrator is a U.S. person if:
                          <ol type="i">
                            <li>
                              an executor or administrator of the estate who is
                              not a U.S. person has sole or shared investment
                              discretion with respect to the assets of the
                              estate; and
                            </li>
                            <li>the estate is governed by foreign law</li>
                          </ol>
                        </li>
                        <li>
                          any trust of which any professional fiduciary acting
                          as trustee is a U.S. person, if a trustee who is not a
                          U.S. person has sole or shared investment discretion
                          with respect to the trust assets, and no beneficiary
                          of the trust (and no settlor if the trust is
                          revocable) is a U.S. person;
                        </li>
                        <li>
                          an employee benefit plan established and administered
                          in accordance with the law of a country other than the
                          United States and customary practices and
                          documentation of such country;
                        </li>
                        <li>
                          any agency or branch of a U.S. person located outside
                          the United States if:
                          <ol type="i">
                            <li>
                              agency or branch operates for valid business
                              reasons; and
                            </li>
                            <li>
                              the agency or branch is engaged in the business of
                              insurance or banking and is subject to substantive
                              insurance or banking regulation, respectively, in
                              the jurisdiction where located; and
                            </li>
                          </ol>
                        </li>
                        <li>
                          The International Monetary Fund, the International
                          Bank for Reconstruction and Development, the
                          Inter-American Development Bank, the Asian Development
                          Bank, the African Development Bank, the United
                          Nations, and their agencies, affiliates and pension
                          plans, and any other similar international
                          organizations, their agencies, affiliates and pension
                          plans;
                        </li>
                      </ol>
                    </li>
                  </ol>
                </li>
                <li>
                  THAT you will not, and will not attempt to, authorise anyone
                  other than you to access and/or use cSwap using a cSwap
                  Supported Blockchain-compatible wallet owned by you or for
                  which you control the private keys, or otherwise engage in
                  Prohibited Use (as defined below) using such cSwap Supported
                  Blockchain-compatible wallet;
                </li>
                <li>
                  THAT you will not disrupt, interfere with, or otherwise
                  adversely affect the normal flow of cSwap or otherwise act in
                  a manner that may negatively affect other Users’ experience
                  when accessing and/or using cSwap including taking advantage
                  of software vulnerabilities and any other act that
                  intentionally abuses or exploits the design of cSwap;
                </li>
                <li>
                  <p>THAT:</p>
                  <ol type="i">
                    <li>
                      you have read and understood the cSwap Documentation
                      (including the Token Swap Tutorial, Liquidity Tutorial,
                      Governance Tutorial and FAQs) and accept all risks set out
                      therein, including smart contract risks and market
                      volatility risks;
                    </li>
                    <li>
                      you are sophisticated in using and evaluating blockchain
                      technologies and related blockchain-based digital assets,
                      including the Comdex Chain, smart contract systems,
                      automated market making protocols, liquidity pool pricing
                      bonding curves, the concept of pricing slippage, the
                      mechanism of liquidity attribution in cSwap and the
                      potential of value loss for liquidity providers due to
                      liquidity attribution and dynamic pricing across different
                      liquidity pools; and
                    </li>
                    <li>
                      you have evaluated and understand all functions of and all
                      risks associated with your access and/or use of cSwap and
                      your undertaking of any cSwap Activity and/or cSwap
                      Transaction using cSwap and have not relied on any
                      information, statement, representation, or warranty,
                      express or implied, made by or on behalf of Company with
                      respect to the access and/or use of cSwap and your
                      undertaking of any cSwap Activity and/or cSwap Transaction
                      using cSwap.
                    </li>
                  </ol>
                </li>
              </ol>
            </li>
            <li>
              All of the above representations and warranties are true,
              complete, accurate and not misleading from the time of your a
            </li>
          </ol>

          <h5>4 Prohibited Use</h5>
          <ol type="1">
            <li>
              You may not, directly or indirectly, engage in any of the
              following activities in connection with your access and/or use of
              cSwap (“Prohibited Uses”):
              <ol type="a">
                <li>
                  A violation of any law, rule, or regulation of any
                  jurisdiction that is applicable to you;
                </li>
                <li>
                  Violations or breaches of these Terms or any other document
                  from time to time governing the access and/or use of cSwap;
                </li>
                <li>
                  Permit others to access and/or use cSwap or otherwise
                  undertake any cSwap Activity and/or cSwap Transaction using a
                  cSwap Supported Blockchain-compatible wallet address that you
                  control;
                </li>
                <li>
                  Perform, or attempt to perform, any actions that would
                  interfere with the normal operation of cSwap or affect the
                  access and/or use of cSwap by other Users;
                </li>
                <li>
                  Engage in, or knowingly facilitate, any fraudulent, deceptive,
                  or manipulative transaction activity in any digital asset
                  using cSwap, including by engaging or participating in
                  “front-running”, “wash trading”, “pump and dump schemes”, or
                  similar activities;
                </li>
                <li>
                  Engage in, or knowingly facilitate, any money laundering,
                  terrorist financing, or other illegal activities;
                </li>
                <li>
                  Access or attempt to access non-public systems, programs,
                  data, or services;
                </li>
                <li>
                  Copy, reproduce, republish, upload, post, transmit, resell, or
                  distribute in any way, any data, content or any part of cSwap,
                  except as expressly permitted by applicable laws; and
                </li>
                <li>
                  Reverse engineer or attempt to reverse engineer cSwap except
                  as expressly permitted by applicable law.
                </li>
              </ol>
            </li>
          </ol>

          <h5>5 Waivers</h5>
          <ol type="1">
            <li>
              You agree and acknowledge that Company and its Affiliates shall
              not be liable for any direct, indirect, special, incidental,
              consequential or other losses of any kind, in tort, contract or
              otherwise (including but not limited to loss of fund, asset,
              revenue, income or profits, and loss of use or data), arising out
              of or in connection with your access and/or use of cSwap or your
              undertaking of any cSwap Activity and/or cSwap Transaction
            </li>
            <li>
              You undertake not to initiate or participate, and waive the right
              to participate in, any class action lawsuit or a class-wide
              arbitration against Company and/or its Affiliates in respect of
              your access and/or use of cSwap or your undertaking of any cSwap
              Activity and/or cSwap Transaction.
            </li>
            <li>
              By accepting these Terms, you waive all rights, claims and/or
              causes of action (present or future) under law (including any
              tortious claims) or contract against Company and its Affiliates in
              connection with your access and/or use of cSwap or your
              undertaking of any cSwap Activity and/or cSwap Transaction.
            </li>
          </ol>

          <h5>6 Termination</h5>
          <ol type="1">
            <li>
              These Terms will remain in full force and effect for so long as
              you access and/or use cSwap or undertake any cSwap Activity and/or
              cSwap Transaction. Company may suspend or terminate your rights to
              access and/or use cSwap at any time for any reason at Company’s
              sole discretion, including for any access and/or use of cSwap in
              violation of these Terms.
            </li>
            <li>
              Upon termination of your rights under these Terms, your right to
              access and/or use cSwap will terminate immediately.
            </li>
            <li>
              Company will not have any liability whatsoever to you for any
              termination of your rights under these Terms, including
              blacklisting any blockchain address you provide to Company. Even
              after your rights under these Terms are terminated, Sections 5,
              6.3, 7 and 8 of these Terms will remain in effect.
            </li>
          </ol>

          <h5>7 Disclaimers and Limitation of Liabilit</h5>

          <ol type="1">
            <li>
              <p>
                <u>Disclaimer</u>
              </p>
              <ol type="a">
                <li>
                  cSWAP (WHICH INCLUDES THE WEBSITE, THE cSWAP SMART CONTRACTS
                  AND COMDEX CHAIN) ARE PROVIDED ON AN “AS-IS” AND “AS
                  AVAILABLE” BASIS, AND COMPANY EXPRESSLY DISCLAIMS ANY AND ALL
                  WARRANTIES AND CONDITIONS OF ANY KIND, WHETHER EXPRESS,
                  IMPLIED, OR STATUTORY, INCLUDING ALL WARRANTIES OR CONDITIONS
                  OF MERCHANTABILITY, MERCHANTABLE QUALITY, FITNESS FOR A
                  PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, ACCURACY, OR
                  NON-INFRINGEMENT. COMPANY DOES NOT MAKE ANY WARRANTY THAT
                  cSWAP WILL MEET YOUR REQUIREMENTS, WILL BE AVAILABLE ON AN
                  UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE BASIS, OR WILL BE
                  ACCURATE, RELIABLE, FREE OF VIRUSES OR OTHER HARMFUL CODE,
                  COMPLETE, LEGAL, OR SAFE. IF APPLICABLE LAW REQUIRES ANY
                  WARRANTIES WITH RESPECT TO cSWAP, ALL SUCH WARRANTIES ARE
                  LIMITED IN DURATION TO SIXTY (60) DAYS FROM THE DATE OF FIRST
                  USE.
                </li>
                <li>
                  COMPANY DOES NOT ENDORSE ANY THIRD PARTY AND SHALL NOT BE
                  RESPONSIBLE IN ANY WAY FOR ANY TRANSACTIONS YOU ENTER INTO
                  WITH ANY OTHER THIRD PARTY, OR FOR ANY LOSS ARISING FROM YOUR
                  RELIANCE ON ANY REPRESENTATION MADE BY OR ANY INFORMATION
                  PROVIDED BY ANY OTHER THIRD PARTY. YOU AGREE THAT COMPANY AND
                  ITS AFFILIATES WILL NOT BE LIABLE FOR ANY LOSS OR DAMAGES OF
                  ANY SORT INCURRED AS A RESULT OF ANY INTERACTIONS BETWEEN YOU
                  AND ANY THIRD PARTY.
                </li>
              </ol>
            </li>
            <li>
              <p>
                <u>Limitation of Liability.</u>
              </p>
              <ol type="a">
                <li>
                  SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF
                  LIABILITY, INCLUDING LIMITATION OF LIABILITY FOR CONSEQUENTIAL
                  OR INCIDENTAL DAMAGES, SO THE FOLLOWING LIMITATION MAY NOT
                  APPLY TO YOU AND YOU MAY HAVE ADDITIONAL RIGHTS.
                </li>
                <li>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL
                  COMPANY AND/OR ITS AFFILIATES BE LIABLE TO YOU OR ANY THIRD
                  PARTY FOR ANY LOST PROFITS, LOST DATA, OR ANY INDIRECT,
                  CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE
                  DAMAGES ARISING OUT OF YOUR USE OF cSWAP, EVEN IF COMPANY HAS
                  BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. ACCESS TO,
                  AND USE OF, cSWAP IS AT YOUR OWN DISCRETION AND RISK, AND YOU
                  WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR DEVICE OR
                  COMPUTER SYSTEM, OR LOSS OF DATA, OR LOSS OF FUND RESULTING
                  THEREFROM.
                </li>
                <li>
                  COMPANY AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY LOSS OR
                  DAMAGE ARISING OUT OF YOUR FAILURE TO KEEP YOUR PRIVATE KEYS
                  OR LOGIN CREDENTIALS TO YOUR WALLET SECURE OR ANY OTHER
                  UNAUTHORIZED ACCESS TO OR TRANSACTIONS INVOLVING YOUR WALLET.
                </li>
                <li>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW,
                  NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, THE
                  LIABILITY OF COMPANY TO YOU FOR ANY DAMAGES ARISING FROM OR
                  RELATED TO THIS AGREEMENT (FOR ANY CAUSE WHATSOEVER AND
                  REGARDLESS OF THE FORM OF THE ACTION), WILL AT ALL TIMES BE
                  LIMITED TO A MAXIMUM OF THE AMOUNT OF TRANSACTION FEES PAID BY
                  YOU IN CONNECTION WITH YOUR ACCESS AND/OR USE OF cSWAP DURING
                  THE PRECEDING TWELVE (12) MONTHS. THE EXISTENCE OF MORE THAN
                  ONE CLAIM WILL NOT ENLARGE THIS LIMIT.
                </li>
              </ol>
            </li>
            <li>
              <p>
                Indemnification. You agree to indemnify and hold Company and its
                Affiliates (each an “Indemnified Party”, and collectively
                “Indemnified Parties”) harmless from any loss, claim or demand
                made, including costs and attorneys’ fees, due to or arising out
                of:
              </p>
              <ul type="i">
                <li>
                  your access and/or use of cSwap (which includes the Website,
                  the cSwap Smart Contracts and Comdex Chain) or your
                  undertaking of any cSwap Activity and/or cSwap Transaction
                  (including Token Swap, Liquidity Provision & Farming and/or
                  Governance Voting);
                </li>
                <li>your non-observance of these Terms; and/or</li>
                <li>your violation of applicable laws or regulations.</li>
              </ul>
              <p>
                The relevant Indemnified Party reserves the right, at your
                expense, to assume the exclusive defense and control of any
                matter for which you are required to provide indemnification,
                and you agree to cooperate in the defense of these claims. You
                agree not to settle any matter without the prior written consent
                of the relevant Indemnified Party or Indemnified Parties. The
                relevant Indemnified Party will use reasonable efforts to notify
                you of any such claim, action or proceeding upon becoming aware
                of it.
              </p>
            </li>
            <li>
              Taxes. You are solely responsible for determining the tax
              implications and tax reporting requirements associated with your
              access and/or use of cSwap and/or associated with any cSwap
              Activity and/or cSwap Transactions you undertake, and for paying
              any applicable taxes in each applicable jurisdiction in relation
              thereto. Company is not responsible for determining whether there
              are tax implications or tax reporting in connection with your
              access and/or use of cSwap and/or associated with any cSwap
              Activity and/or cSwap Transactions you undertake, or for paying
              any applicable taxes in relation thereto.
            </li>
            <li>
              Potential Risks Associated with Access and/or Use of cSwap (which
              includes the Website, the cSwap Smart Contracts and the Comdex
              Chain).
              <ol type="a">
                <li>
                  Like all software, cSwap (which includes the Website, the
                  cSwap Smart Contracts and the Comdex Chain) may be subject to
                  exploits. Company is not responsible for exploits of any kind.
                  While Company has taken a number of precautions to ensure the
                  security of cSwap (which includes the Website, the cSwap Smart
                  Contracts and the Comdex Chain), the technology is relatively
                  new and it is not possible to guarantee that the code is
                  completely free from bugs or errors. Users accept all risks
                  that arise from access and/or use of cSwap (which includes the
                  Website, the cSwap Smart Contracts and the Comdex Chain),
                  including, and not limited to, the risk of any digital assets
                  being lost due to a failure, malfunction or exploit of cSwap
                  (whether in relation to the Website, the cSwap Smart Contracts
                  and/or the Comdex Chain).
                </li>
                <li>
                  You are solely responsible for securing the private keys
                  associated with any cSwap Supported Blockchain-compatible
                  wallet you may use when accessing and/or using cSwap. You
                  understand that anyone who obtains your private keys and
                  access to your device may access such cSwap Supported
                  Blockchain-compatible wallet controlled with those private
                  keys with or without your authorisation and may transfer out
                  any digital assets from the blockchain address associated with
                  such cSwap Supported Blockchain-compatible wallet.
                </li>
                <li>
                  The value of any digital asset, where value is attached to
                  such an asset, may fluctuate. Company makes no guarantees as
                  to the price or value of any digital asset on any secondary
                  market, including the yield attributable to any cSwap Activity
                  and/or cSwap Transaction that you undertake.
                </li>
                <li>
                  The following risks are associated with blockchain-based
                  digital assets involved in connection with your access and/or
                  use of cSwap and your undertaking of cSwap Activities and/or
                  cSwap Transactions : the risk of losing private keys, theft
                  resulting from third parties discovering your private key,
                  value fluctuation of digital assets on the secondary market,
                  disruptions to the Comdex Chain and/or other IBC-enabled
                  blockchains connected to cSwap caused by network congestion,
                  lack of usability of, or loss of value with respect to,
                  digital assets due to a hard fork or other disruption to the
                  Comdex Chain and/or other IBC-enabled blockchains connected to
                  cSwap, or errors or vulnerabilities in the smart contract code
                  associated with a given digital asset or transactions
                  involving digital assets. Transfers on the Comdex Chain are
                  irreversible. Once an instruction, signed by the required
                  private key(s), to transfer a digital asset from one
                  blockchain address to another has been executed, it cannot be
                  undone.
                </li>
                <li>
                  Support for your access and/or use of cSwap (which includes
                  the Website, the cSwap Smart Contracts and the Comdex Chain)
                  whether via the Website and/or Direct Access or for your
                  undertaking of any cSwap Activity and/or cSwap Transaction
                  (including Token Swap, Liquidity Provision & Farming and/or
                  Governance Voting) may be modified or discontinued at any
                  time, and Company reserves the right, at any time, in its sole
                  discretion, to modify the Website and/or the cSwap Smart
                  Contracts.
                </li>
                <li>
                  In the event of a change or other network disruption to Comdex
                  Chain and/or other IBC-enabled blockchains connected to cSwap,
                  whether resulting in a fork of Comdex Chain and/or other
                  IBC-enabled blockchains connected to cSwap, cSwap may halt and
                  stop functioning and you may not be able to undertake or
                  complete any cSwap Activity and/or cSwap Transaction. In
                  addition, in the event of a fork, cSwap Activity and/or cSwap
                  Transaction on the Comdex Chain and/or other IBC-enabled
                  blockchains connected to cSwap may be disrupted.
                </li>
                <li>
                  The Comdex Chain and/or other IBC-enabled blockchains
                  connected to cSwap charge a fee for engaging in a transaction
                  on the applicable network. Those network transaction fees
                  fluctuate over time depending on a variety of factors. You are
                  solely responsible for paying network transaction fees
                  associated with any cSwap Activity and/or cSwap Transaction
                  you undertake using cSwap whether on the Comdex Chain and/or
                  other IBC-enabled blockchains connected to cSwap. You are also
                  solely responsible for any other third-party fees that may be
                  incurred in connection with your access and/or use of cSwap.
                </li>
              </ol>
            </li>
          </ol>
          <ul className="unstyled">
            <li>
              <b>Dispute Resolution.</b> Subject always to Sections 5 and 7 of
              these Terms, any claim, suit, or dispute arising out of or in
              connection with these Terms, including any question regarding its
              existence, validity or termination, shall be referred to and
              finally be resolved by arbitration in accordance with the
              arbitration rules of the British Virgin Islands, before a panel of
              three (3) arbitrators. Each of the Parties hereby has the right to
              appoint an arbitrator, and the two (2) appointed arbitrators shall
              select the third arbitrator. The panel shall reach its decisions
              by a vote of a majority. Any claim shall be brought individually
              on behalf of the person or entity seeking relief, not on behalf of
              a class or other persons or entities not participating in the
              arbitration and shall not be consolidated with the claim of any
              person who is not asserting a claim arising under or relating to
              this contract. The seat of arbitration shall be the British Virgin
              Islands and the language of any arbitration shall be English.
              Judgment on any award rendered by the arbitrators may be entered
              by any court of competent jurisdiction.
            </li>
            <li>
              <b>Electronic Communications with Company.</b> The communications
              between you and Company use electronic means, either through the
              Website or electronic mail, whether Company communicates by
              posting notices on the Website, or communicates with you via
              email. For contractual purposes, you: (i) hereby consent to
              receive communications from Company in any electronic form; and
              (ii) hereby agree that all terms and conditions, agreements,
              notices, disclosures, and other communications that Company
              provides to you electronically satisfy any legal requirement that
              would also be satisfied if such communications were to be in a
              hardcopy writing. The foregoing does not affect your non-waivable
              rights under any applicable law.
            </li>
          </ul>

          <h5>10 Governing Law and Jurisdiction</h5>
          <ol type="1">
            <li>
              These Terms and any dispute or claim arising out of or in
              connection with their subject matter or formation (including
              non-contractual disputes or claims) shall be governed by and
              construed in accordance with the law of the British Virgin
              Islands.
            </li>
            <li>
              cSwap may not be available or permitted by laws for use in some
              jurisdictions (including the Excluded Jurisdictions). Company and
              its Affiliates do not represent or warrant that cSwap or any part
              thereof is available or permitted by laws for use in any
              particular jurisdiction. In choosing to access and/or use cSwap,
              you do so on your own initiative and at your own risk, and you are
              responsible for complying with all applicable local laws, rules
              and regulations.
            </li>
          </ol>

          <h5>11 General</h5>
          <ol type="1">
            <li>
              <u>Entire Terms.</u> These Terms constitute the entire agreement
              between you and Company regarding your access and/or use of cSwap.
              The section titles in these Terms are for convenience only and
              have no legal or contractual effect. The word “including” means
              “including without limitation”.
            </li>
            <li>
              <u>Severability.</u> If any provision of these Terms is, for any
              reason, held to be invalid or unenforceable, the other provisions
              of these Terms will be unimpaired and the invalid or unenforceable
              provision will be deemed modified so that it is valid and
              enforceable to the maximum extent permitted by law.
            </li>
            <li>
              <u>Relationship of the Parties.</u> Nothing contained in this
              Agreement will be deemed to be construed by the Parties or any
              third party as creating a partnership, an agency relationship or
              joint venture between the Parties or any of their respective
              employees, representatives, or agents.
            </li>
            <li>
              <u>Third party rights.</u> Save for the Indemnified Parties who
              shall have rights and benefits to the extent accorded thereto
              under these Terms, any person who is not a Party to these Terms
              shall have no right to enforce any provisions of this Agreement.
            </li>
            <li>
              <u>Assignment.</u> These Terms, and your rights and obligations
              herein, may not be assigned, subcontracted, delegated, or
              otherwise transferred by you without Company’s prior written
              consent, and any attempted assignment, subcontract, delegation, or
              transfer in violation of the foregoing will be null and void.
              Company may freely assign these Terms. The terms and conditions
              set forth in these Terms shall be binding upon assignees.
            </li>
            <li>
              <u>Changes.</u> Company reserves the right to change these Terms
              in its sole discretion from time to time. The “Date Last Revised”
              specified on these Terms indicates the date on which the Terms
              were last changed. You will be notified of those changes and given
              the opportunity to review and accept the updated Terms when you
              next access and/or use cSwap. These changes will be effective upon
              your acceptance of the updated Terms. In addition, continued
              access and/or use of cSwap following notice of such changes shall
              indicate your acknowledgement of such changes and agreement to be
              bound by the terms and conditions of such changes.
            </li>
            <li>
              <u>Waiver.</u> A waiver by Company of any right or remedy under
              these Terms shall only be effective if it is in writing, executed
              by a duly authorised representative of Company and shall apply
              only to the circumstances for which it is given. The failure of
              Company to exercise or enforce any right or remedy under these
              Terms shall not operate as a waiver of such right or remedy, nor
              shall it prevent any future exercise or enforcement of such right
              or remedy. No single or partial exercise of any right or remedy
              shall preclude or restrict the further exercise of any such right
              or remedy or other rights or remedies.
            </li>
          </ol>
        </div>
        <div className="tc-check">
          <Checkbox
            onChange={() => {
              setIsChecked((value) => !value);
            }}
          >
            Accept Terms Conditions
          </Checkbox>
        </div>
        <div className="text-center pt-3">
          <Button
            disabled={!isChecked}
            type="primary"
            onClick={(e) => {
              e.preventDefault();
              setIsModalOpen(false);
              localStorage.setItem("agreement_accepted", "true");
            }}
          >
            Accept
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default TermsModal;
